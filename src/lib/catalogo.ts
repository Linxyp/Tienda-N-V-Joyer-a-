// Catálogo completo, armado en el momento del build (solo se usa en componentes de servidor).
// Fuentes:
//   data/nv-propios.json   → productos propios de N&V (precio propio)
//   data/proveedor.json    → catálogo importado del proveedor (ya con el margen aplicado al importar)
//   data/ajustes.json      → productos ocultos, precios/nombres a mano, destacados
import { readFileSync } from "node:fs";
import path from "node:path";
import { CATEGORIAS, type CategoriaId } from "@/config/categorias";
import { describir } from "./descripciones";
import type { Foto, Producto, ProductoResumen } from "./tipos";
import { hash } from "./utilidades";

interface Ajustes {
  ocultar: string[];
  precios: Record<string, number>;
  nombres: Record<string, string>;
  destacados: string[];
}

interface ProductoPropio {
  id: string;
  sku: string;
  slug: string;
  nombre: string;
  categoria: CategoriaId;
  sub?: string;
  precio: number;
  descripcion?: string;
  etiquetas?: string[];
  fotos: Foto[];
}

interface ProductoProveedor {
  id: string;
  sku: string;
  slug: string;
  nombre: string;
  categoria: CategoriaId;
  sub?: string;
  etiquetas?: string[];
  precio: number;
  colores?: string[];
  tallas?: string[];
  letra?: boolean;
  premium?: boolean;
  nuevo?: boolean;
  caracteristicas: string[];
  fotos: Foto[];
  duplicaDe?: string;
  proveedor?: { ids: string[] };
}

const leer = <T,>(archivo: string): T =>
  JSON.parse(readFileSync(path.join(process.cwd(), "data", archivo), "utf8")) as T;

const PALABRAS_COLOR = /\b(cristal|crystal|verde|negro|negra|rojo|roja|rosa|azul|fucsia|blanco|blanca|esmerald)/i;

function caracteristicasBase(nombre: string, categoria: CategoriaId, sub?: string) {
  const c = ["Oro laminado 18K"];
  const largo = nombre.match(/(\d+(?:,\d+)?) cm/);
  const grosor = nombre.match(/(\d+(?:,\d+)?) mm/);
  if (largo) c.push(`Largo: ${largo[1]} cm`);
  if (grosor) c.push(`${["topos", "candongas", "dijes"].includes(categoria) ? "Tamaño" : "Grosor"}: ${grosor[1]} mm`);
  if (sub === "rosca") c.push("Cierre de rosca de seguridad");
  return c;
}

const ORDEN_CATEGORIAS: CategoriaId[] = [
  "topos", "cadenas", "pulseras", "dijes", "candongas", "anillos", "tobilleras", "conjuntos", "rosarios",
];

/** Orden "Destacados": primero los elegidos a mano y luego una mezcla variada entre categorías. */
function ordenar(lista: Producto[], destacados: string[]) {
  const puntaje = (p: Producto) =>
    (p.premium ? 2 : 0) +
    (p.fotos.length >= 2 ? 1 : 0) +
    (p.origen === "nv" ? 1.5 : 0) +
    (p.nuevo ? 0.5 : 0) +
    (hash(p.id) % 1000) / 1000;

  const elegidos = destacados
    .map((id) => lista.find((p) => p.id === id || p.slug === id || p.sku === id))
    .filter((p): p is Producto => Boolean(p));
  const resto = lista.filter((p) => !elegidos.includes(p));
  const colas = ORDEN_CATEGORIAS.map((c) =>
    resto.filter((p) => p.categoria === c).sort((a, b) => puntaje(b) - puntaje(a)),
  );
  const mezcla: Producto[] = [...elegidos];
  for (let i = 0; colas.some((c) => i < c.length); i++) for (const c of colas) if (i < c.length) mezcla.push(c[i]);
  mezcla.forEach((p, i) => (p.orden = i));
  return mezcla;
}

let cache: Producto[] | null = null;

export function productos(): Producto[] {
  if (cache) return cache;
  const ajustes = leer<Ajustes>("ajustes.json");
  const propios = leer<ProductoPropio[]>("nv-propios.json");
  const proveedor = leer<ProductoProveedor[]>("proveedor.json");
  const coincidencias = leer<Record<string, string[] | string>>("coincidencias.json");

  const duplicados = new Map<string, ProductoProveedor[]>();
  for (const r of proveedor)
    if (r.duplicaDe) duplicados.set(r.duplicaDe, [...(duplicados.get(r.duplicaDe) ?? []), r]);

  const lista: Producto[] = [];

  for (const p of propios) {
    // Si el proveedor también vende la pieza, la referencia es su código de fábrica (el primero verificado)
    const verificados = coincidencias[p.id];
    const orden = Array.isArray(verificados) ? verificados : [];
    const posicion = (d: ProductoProveedor) => {
      const i = Math.min(...(d.proveedor?.ids ?? []).map((id) => orden.indexOf(id)).filter((n) => n >= 0));
      return Number.isFinite(i) ? i : 99;
    };
    const dups = [...(duplicados.get(p.id) ?? [])].sort((a, b) => posicion(a) - posicion(b));
    const heredaOpciones = !PALABRAS_COLOR.test(p.nombre);
    const colores = heredaOpciones ? dups.find((d) => d.colores?.length)?.colores : undefined;
    const tallas = dups.find((d) => d.tallas?.length)?.tallas;
    const extra = dups.flatMap((d) =>
      d.caracteristicas.filter((c) => !/^(oro laminado|largo|grosor|tamaño)/i.test(c)),
    );
    lista.push({
      id: p.id,
      sku: dups[0]?.sku ?? p.sku,
      slug: p.slug,
      nombre: p.nombre,
      categoria: p.categoria,
      sub: p.sub,
      etiquetas: [...new Set([...(p.etiquetas ?? []), ...dups.flatMap((d) => d.etiquetas ?? [])])],
      precio: p.precio,
      ...(colores ? { colores } : {}),
      ...(tallas ? { tallas } : {}),
      premium: dups.some((d) => d.premium) || undefined,
      caracteristicas: [...new Set([...caracteristicasBase(p.nombre, p.categoria, p.sub), ...extra])],
      descripcion: describir(p),
      fotos: [...p.fotos, ...dups.flatMap((d) => d.fotos)].slice(0, 6),
      origen: "nv",
      orden: 0,
    });
  }

  for (const r of proveedor) {
    if (r.duplicaDe) continue;
    const caracteristicas = [...r.caracteristicas];
    if (r.sub === "rosca" && !caracteristicas.some((c) => /rosca/i.test(c)))
      caracteristicas.push("Cierre de rosca de seguridad");
    lista.push({
      id: r.id,
      sku: r.sku,
      slug: r.slug,
      nombre: r.nombre,
      categoria: r.categoria,
      sub: r.sub,
      etiquetas: r.etiquetas ?? [],
      precio: r.precio,
      ...(r.colores ? { colores: r.colores } : {}),
      ...(r.tallas ? { tallas: r.tallas } : {}),
      ...(r.letra ? { letra: true } : {}),
      ...(r.premium ? { premium: true } : {}),
      ...(r.nuevo ? { nuevo: true } : {}),
      caracteristicas,
      descripcion: describir(r),
      fotos: r.fotos,
      origen: "proveedor",
      orden: 0,
    });
  }

  const ocultos = new Set(ajustes.ocultar ?? []);
  const visibles = lista
    .filter((p) => !ocultos.has(p.id) && !ocultos.has(p.sku) && !ocultos.has(p.slug))
    .map((p) => {
      const nombre = ajustes.nombres?.[p.id] ?? ajustes.nombres?.[p.sku];
      const valor = ajustes.precios?.[p.id] ?? ajustes.precios?.[p.sku];
      return { ...p, ...(nombre ? { nombre } : {}), ...(valor ? { precio: valor } : {}) };
    });

  cache = ordenar(visibles, ajustes.destacados ?? []);
  return cache;
}

export const productoPorSlug = (slug: string) => productos().find((p) => p.slug === slug);

export const productosDeCategoria = (categoria: CategoriaId) => productos().filter((p) => p.categoria === categoria);

export function resumen(p: Producto): ProductoResumen {
  return {
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    nombre: p.nombre,
    categoria: p.categoria,
    ...(p.sub ? { sub: p.sub } : {}),
    etiquetas: p.etiquetas,
    precio: p.precio,
    mini: p.fotos[0].mini ?? p.fotos[0].src,
    ...(p.fotos[1] ? { mini2: p.fotos[1].mini ?? p.fotos[1].src } : {}),
    ...(p.premium ? { premium: true } : {}),
    ...(p.nuevo ? { nuevo: true } : {}),
    ...(p.colores?.length || p.tallas?.length || p.letra ? { opciones: true } : {}),
    orden: p.orden,
  };
}

/** Productos parecidos: misma categoría (y subcategoría si hay), precio cercano. */
export function relacionados(p: Producto, n = 8) {
  const misma = productos().filter((x) => x.id !== p.id && x.categoria === p.categoria);
  return misma
    .map((x) => ({ x, d: (x.sub === p.sub ? 0 : 1) * 1e6 + Math.abs(x.precio - p.precio) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((r) => r.x);
}

export interface ResumenCategoria {
  id: CategoriaId;
  nombre: string;
  lema: string;
  total: number;
  desde: number;
  portada: string;
  portada2?: string;
}

/** Datos para las tarjetas de categorías (cantidad, precio desde y foto de portada). */
export function resumenCategorias(): ResumenCategoria[] {
  return CATEGORIAS.map((c) => {
    const lista = productosDeCategoria(c.id);
    const conFoto = lista.filter((p) => p.fotos[0].mini);
    return {
      id: c.id,
      nombre: c.nombre,
      lema: c.lema,
      total: lista.length,
      desde: Math.min(...lista.map((p) => p.precio)),
      portada: conFoto[0]?.fotos[0].mini ?? lista[0].fotos[0].src,
      portada2: conFoto[1]?.fotos[0].mini,
    };
  }).filter((c) => c.total > 0);
}
