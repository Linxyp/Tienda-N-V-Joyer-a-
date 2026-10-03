// Importa (o actualiza) el catálogo del proveedor (datos de conexión en data/privado/proveedor.json)
//
//   npm run importar
//
// - Trae todos los productos publicados, limpia nombres y detecta colores/tallas.
// - Une los productos repetidos (el proveedor publica el mismo topo en "Topos" y "Topos para hombres").
// - Marca los que ya existen en data/nv-propios.json (data/coincidencias.json) para no duplicarlos.
// - Descarga y optimiza las fotos en public/img/p/.
// - Escribe data/proveedor.json (solo precio de venta) y data/privado/reporte-proveedor.csv
//   (uso interno: costo, precio N&V y bodega; esa carpeta no se sube a GitHub).
//
// Precio de venta = precio del proveedor + "margen" (data/privado/proveedor.json). Si cambias el margen,
// vuelve a ejecutar `npm run importar`.
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { PROVEEDOR, traerCategorias, traerProductos } from "./lib/proveedor-api.mjs";
import { descargar, enParalelo } from "./lib/descargas.mjs";
import { distancia, fotoGrande, huella, miniatura } from "./lib/imagenes.mjs";
import {
  CATEGORIAS_PROVEEDOR, caracteristicas, categoriaPorCodigo, categoriaPorNombre, htmlATexto,
  nombreComercial, nucleo, parsearDescripcion, parsearTitulo, slugify,
} from "./lib/normalizar.mjs";

const CACHE = path.resolve(".cache/proveedor");
/** Miniatura pequeña (360 px) que acompaña a cada "-m.webp" (640 px) para pantallas de baja densidad. */
const miniPequena = (mini) => mini.replace(/-m\.webp$/, "-s.webp");
const SALIDA = "public/img/p";
const leer = (f, def) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : def);
const DIAS_NUEVO = 45;

console.log("1/6 Consultando el catálogo del proveedor…");
const [crudos, categorias] = await Promise.all([traerProductos(), traerCategorias()]);
const nombreCat = Object.fromEntries(categorias.map((c) => [c.objectId, c.name]));
const visibles = crudos.filter((p) => p.mostrar_catalogo && p.precio > 0);
console.log(`   ${crudos.length} productos en total, ${visibles.length} publicados`);

// ---------------------------------------------------------------------------
console.log("2/6 Normalizando…");
let registros = visibles.map((p) => {
  const texto = htmlATexto(p.body);
  const info = parsearDescripcion(texto);
  const { bodega, codigo } = parsearTitulo(p.titulo);
  const idCat = p.subcategory?.objectId || p.catalogos?.[0]?.objectId;

  // Combos "Cadena … ref 43028 / Cadena … ref 44021 / dije … ref 23181"
  const lineasRef = texto.split("\n").filter((l) => /\bref\.?\s*\d{4,}/i.test(l));
  let crudo = info.nombreCrudo;
  let cat = CATEGORIAS_PROVEEDOR[nombreCat[idCat]] || categoriaPorNombre(crudo) || categoriaPorCodigo(codigo);
  if (lineasRef.length > 1) {
    crudo = lineasRef.map((l) => l.replace(/\bref\.?\s*\d+.*$/i, "").trim()).join(" + ");
    cat = { categoria: "conjuntos" };
  }
  if (!cat) {
    console.warn(`   ⚠ Sin categoría, se omite: ${p.titulo} — ${crudo}`);
    return null;
  }
  let { categoria, sub } = cat;
  const etiquetas = new Set(cat.etiquetas || []);
  if (categoria === "topos" && /candonga/i.test(crudo)) { categoria = "candongas"; sub = undefined; }
  if (categoria === "topos" && sub !== "rosca" && /rosca/i.test(crudo)) sub = "rosca";
  if (info.unisex) etiquetas.add("unisex");
  if (/hombre/i.test(crudo)) etiquetas.add("hombre");

  const nombre = nombreComercial(crudo, categoria, sub);
  return {
    proveedorId: p.objectId,
    titulo: p.titulo.trim(),
    codigo: codigo && !/^(0+|\d{1,3})$/.test(codigo) ? codigo : null,
    bodegas: bodega ? [bodega] : [],
    nombre,
    categoria,
    sub,
    etiquetas,
    colores: new Set(info.colores),
    tallas: new Set(info.tallas),
    letra: /\bletra\b/i.test(nombre),
    premium: info.premium,
    caracteristicas: caracteristicas(nombre, info, categoria),
    precioProveedor: p.precio,
    creado: p.createdAt,
    fotosRemotas: (p.image || []).map((i) => i.url),
    unidos: [p.objectId],
  };
}).filter(Boolean);

// ---------------------------------------------------------------------------
console.log("3/6 Descargando fotos (con caché)…");
const urls = [...new Set(registros.flatMap((r) => r.fotosRemotas))];
await enParalelo(urls.map((u) => () => descargar(u, path.join(CACHE, path.basename(new URL(u).pathname)))), 10);
const local = (u) => path.join(CACHE, path.basename(new URL(u).pathname));
const huellas = new Map();
await enParalelo(urls.map((u) => async () => huellas.set(u, await huella(local(u)))), 8);

// ---------------------------------------------------------------------------
console.log("4/6 Uniendo productos repetidos…");
// Mismo código de fábrica + misma categoría = misma pieza, aunque el proveedor la haya publicado dos veces con
// otro nombre o con precios distintos (se toma el mayor). Sin código: mismo nombre y mismo precio.
const clave = (r) =>
  r.codigo ? `c:${r.codigo}:${r.categoria}` : `n:${r.categoria}:${nucleo(r.nombre)}:${r.precioProveedor}`;
const grupos = new Map();
const unir = (a, b) => {
  for (const e of b.etiquetas) a.etiquetas.add(e);
  for (const c of b.colores) a.colores.add(c);
  for (const t of b.tallas) a.tallas.add(t);
  for (const g of b.bodegas) if (!a.bodegas.includes(g)) a.bodegas.push(g);
  a.premium ||= b.premium;
  a.unidos.push(...b.unidos);
  (a.nombresUnidos ??= [a.nombre]).push(b.nombre);
  // Fotos nuevas solo si no son la misma imagen subida dos veces
  for (const u of b.fotosRemotas)
    if (!a.fotosRemotas.some((x) => distancia(huellas.get(x), huellas.get(u)) <= 6)) a.fotosRemotas.push(u);
  if (a.creado > b.creado) a.creado = b.creado;
  a.precioProveedor = Math.max(a.precioProveedor, b.precioProveedor);
  // Si uno estaba en "Topos" y otro solo en "para hombres", queda en la categoría general
  if (!a.sub && b.sub) a.sub = b.sub;
};
for (const r of registros) {
  const k = clave(r);
  if (grupos.has(k)) unir(grupos.get(k), r);
  else grupos.set(k, r);
}
let unicos = [...grupos.values()];
// Segunda pasada: misma foto + mismo precio + misma categoría (nombres distintos para el mismo producto)
const finales = [];
for (const r of unicos) {
  const h = huellas.get(r.fotosRemotas[0]);
  const gemelo = finales.find(
    (f) => f.categoria === r.categoria && f.precioProveedor === r.precioProveedor && distancia(huellas.get(f.fotosRemotas[0]), h) <= 4,
  );
  if (gemelo) unir(gemelo, r);
  else finales.push(r);
}
unicos = finales;
console.log(`   ${registros.length} publicaciones → ${unicos.length} productos únicos`);

// ---------------------------------------------------------------------------
console.log("5/6 Cruzando con los productos propios de N&V…");
const propios = leer("data/nv-propios.json", []);
const coincidencias = leer("data/coincidencias.json", {}); // { "nv-t5": ["objectIdProveedor", …] }
const duplicaDe = new Map();
for (const [idPropio, ids] of Object.entries(coincidencias)) if (Array.isArray(ids)) for (const id of ids) duplicaDe.set(id, idPropio);

// Sugerencias para revisar a mano (nombre parecido o foto parecida, misma categoría)
const sugerencias = [];
for (const p of propios) {
  const np = nucleo(p.nombre);
  const cands = unicos
    .filter((r) => r.categoria === p.categoria)
    .map((r) => ({
      r,
      dist: p.huella ? distancia(p.huella, huellas.get(r.fotosRemotas[0])) : 64,
      igual: nucleo(r.nombre) === np,
      contiene: np.length >= 4 && (nucleo(r.nombre).includes(np) || np.includes(nucleo(r.nombre))),
    }))
    .filter((c) => c.igual || c.contiene || c.dist <= 10)
    .sort((a, b) => b.igual - a.igual || a.dist - b.dist)
    .slice(0, 4);
  if (cands.length)
    sugerencias.push({
      propio: `${p.id} · ${p.nombre} · $${p.precio}`,
      candidatos: cands.map((c) => `${c.r.unidos.join("+")} · ${c.r.nombre} · prov $${c.r.precioProveedor} · foto≈${c.dist}${c.igual ? " · MISMO NOMBRE" : ""}`),
    });
}
await writeFile(".cache/coincidencias-sugeridas.json", JSON.stringify(sugerencias, null, 2));

// ---------------------------------------------------------------------------
console.log("6/6 Optimizando fotos y escribiendo datos…");
const hoy = Date.now();
const slugs = new Set(propios.map((p) => p.slug));
// Lo que N&V suma al precio del proveedor (data/privado/proveedor.json → "margen")
const margen = Number(PROVEEDOR.margen ?? 15000);
const salida = [];
const privado = new Map();
for (const r of unicos) {
  let slug = slugify(r.nombre) || "producto";
  if (slugs.has(slug)) slug = `${slug}-${r.proveedorId.slice(-4).toLowerCase()}`;
  slugs.add(slug);
  const duplicado = r.unidos.map((id) => duplicaDe.get(id)).find(Boolean);
  const fotos = r.fotosRemotas.slice(0, 5).map((u, i) => ({
    src: `img/p/${slug}-${i + 1}.webp`,
    ...(i < 2 ? { mini: `img/p/${slug}-${i + 1}-m.webp` } : {}),
    _origen: local(u),
  }));
  salida.push({
    id: `p-${r.proveedorId}`,
    sku: `NV-${r.codigo || r.proveedorId.slice(-5).toUpperCase()}`,
    slug,
    nombre: r.nombre,
    categoria: r.categoria,
    ...(r.sub ? { sub: r.sub } : {}),
    ...(r.etiquetas.size ? { etiquetas: [...r.etiquetas].sort() } : {}),
    precio: r.precioProveedor + margen,
    ...(r.colores.size > 0 ? { colores: [...r.colores] } : {}),
    ...(r.tallas.size > 0 ? { tallas: [...r.tallas].sort((a, b) => parseFloat(a.replace(",", ".")) - parseFloat(b.replace(",", "."))) } : {}),
    ...(r.letra ? { letra: true } : {}),
    ...(r.premium ? { premium: true } : {}),
    ...(hoy - Date.parse(r.creado) < DIAS_NUEVO * 864e5 ? { nuevo: true } : {}),
    caracteristicas: r.caracteristicas,
    fotos,
    creado: r.creado.slice(0, 10),
    ...(duplicado ? { duplicaDe: duplicado } : {}),
    proveedor: { ids: r.unidos },
  });
  privado.set(`p-${r.proveedorId}`, { costo: r.precioProveedor, titulo: r.titulo, bodegas: r.bodegas });
}

await enParalelo(
  salida.flatMap((p) =>
    p.fotos.map((f) => async () => {
      await fotoGrande(f._origen, path.join("public", f.src));
      if (f.mini) {
        await miniatura(f._origen, path.join("public", f.mini));
        await miniatura(f._origen, path.join("public", miniPequena(f.mini)), { ancho: 360, alto: 450, calidad: 76 });
      }
    }),
  ),
  6,
  (n, t) => n % 200 === 0 && console.log(`   fotos ${n}/${t}`),
);

// Borra fotos de productos que el proveedor ya no publica
const vigentes = new Set(
  salida.flatMap((p) => p.fotos.flatMap((f) => [f.src, f.mini, f.mini && miniPequena(f.mini)].filter(Boolean).map((s) => path.basename(s)))),
);
let borradas = 0;
if (existsSync(SALIDA))
  for (const f of await readdir(SALIDA))
    if (!vigentes.has(f)) { await rm(path.join(SALIDA, f)); borradas++; }

for (const p of salida) for (const f of p.fotos) delete f._origen;
salida.sort((a, b) => a.categoria.localeCompare(b.categoria) || b.creado.localeCompare(a.creado));
await writeFile("data/proveedor.json", JSON.stringify(salida, null, 1) + "\n");

const csv = [
  "sku;nombre;categoria;precio_proveedor;precio_nv;bodega;titulo_proveedor;duplica_producto_propio",
  ...salida.map((p) =>
    [p.sku, p.nombre, p.categoria, privado.get(p.id).costo, p.precio, privado.get(p.id).bodegas.join("/"), privado.get(p.id).titulo, p.duplicaDe || ""]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(";"),
  ),
].join("\n");
await mkdir("data/privado", { recursive: true });
const BOM = String.fromCharCode(0xfeff); // para que Excel abra bien las tildes
await writeFile("data/privado/reporte-proveedor.csv", BOM + csv + String.fromCharCode(10));

const enVenta = salida.filter((p) => !p.duplicaDe).length;
console.log(`Listo: ${salida.length} productos del proveedor (${enVenta} nuevos en la tienda, ${salida.length - enVenta} ya estaban en tu catálogo).`);
if (borradas) console.log(`   ${borradas} fotos antiguas eliminadas`);
console.log(`   Sugerencias de coincidencias para revisar: .cache/coincidencias-sugeridas.json`);
