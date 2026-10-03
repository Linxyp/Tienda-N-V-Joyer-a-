import { categoriaPorId, nombreSub } from "@/config/categorias";
import type { ProductoResumen } from "./tipos";
import { asset, normalizar } from "./utilidades";

let promesa: Promise<ProductoResumen[]> | null = null;

/** Descarga (una sola vez) el índice compacto del catálogo generado en el build. */
export function cargarCatalogo() {
  promesa ??= fetch(asset("catalogo.json"))
    .then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar el catálogo");
      return r.json() as Promise<ProductoResumen[]>;
    })
    .catch((e) => {
      promesa = null;
      throw e;
    });
  return promesa;
}

// Palabras que la gente usa y su equivalente en el catálogo (cualquiera de las alternativas sirve)
const SINONIMOS: Record<string, string[]> = {
  arete: ["topo", "arete", "candonga"],
  areta: ["topo", "arete"],
  zarcillo: ["candonga"],
  argolla: ["argolla", "candonga"],
  collar: ["cadena", "collar", "gargantilla"],
  manilla: ["pulsera", "manilla"],
  trebol: ["trebol", "clover"],
  clover: ["trebol", "clover"],
  corazon: ["corazon", "heart", "love"],
  estrella: ["estrella", "star"],
  caballero: ["hombre"],
  virgen: ["virgen", "guadalupe", "milagrosa", "carmen"],
  oro: [],
  dorado: [],
  dorada: [],
  laminado: [],
};

const singular = (w: string) =>
  w.length > 4 && /(ones|ores|eses)$/.test(w) ? w.slice(0, -2) : w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w;

const indice = new WeakMap<ProductoResumen, string>();
function texto(p: ProductoResumen) {
  let t = indice.get(p);
  if (!t) {
    t = normalizar(
      [p.nombre, categoriaPorId(p.categoria)?.nombre, nombreSub(p.categoria, p.sub), p.sku, ...p.etiquetas, p.premium ? "premium" : ""].join(" "),
    );
    indice.set(p, t);
  }
  return t;
}

/** Búsqueda tolerante: cada palabra debe aparecer (sin tildes, singular/plural y sinónimos comunes). */
export function buscar(lista: ProductoResumen[], consulta: string) {
  const grupos = normalizar(consulta)
    .split(" ")
    .filter(Boolean)
    .map((w) => {
      const s = singular(w);
      return SINONIMOS[s] ?? SINONIMOS[w] ?? [s];
    })
    .filter((alternativas) => alternativas.length > 0);
  if (!grupos.length) return [];
  return lista
    .filter((p) => grupos.every((alts) => alts.some((w) => texto(p).includes(w))))
    .map((p) => {
      const n = normalizar(p.nombre);
      let puntos = 0;
      for (const alts of grupos)
        for (const w of alts) {
          if (n.startsWith(w) || n.includes(` ${w}`)) puntos += 2;
          else if (n.includes(w)) puntos += 1;
        }
      return { p, puntos: puntos - p.orden / 10000 };
    })
    .sort((a, b) => b.puntos - a.puntos)
    .map((r) => r.p);
}
