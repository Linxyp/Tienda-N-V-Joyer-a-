// Migración única del catálogo anterior (linxyp.github.io/Tienda-N-V-Joyer-a-) a data/nv-propios.json.
// Después de correrla, data/nv-propios.json es la fuente de verdad de los productos propios.
import { existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fotoGrande, huella, miniatura } from "./lib/imagenes.mjs";
import { nombreComercial, slugify } from "./lib/normalizar.mjs";
import { enParalelo } from "./lib/descargas.mjs";

const ORIGEN = "_source/actual";
const html = readFileSync(path.join(ORIGEN, "catalogo-actual.html"), "utf8");
const re = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*price:\s*(\d+),\s*category:\s*'([^']+)',\s*image:\s*'([^']+)'\s*\}/g;
const crudos = [...html.matchAll(re)].map((m) => ({ id: m[1], nombre: m[2], precio: +m[3], categoria: m[4], imagen: m[5] }));

// Nombres descriptivos para las pulseras que estaban como "Pulsera" (revisando cada foto)
const rutaNombres = path.join(ORIGEN, "nombres-pulseras.json");
const nombresPulseras = existsSync(rutaNombres)
  ? Object.fromEntries(JSON.parse(readFileSync(rutaNombres, "utf8")).map((n) => [n.file, n]))
  : {};

// Correcciones evidentes del catálogo anterior
const CORRECCIONES = {
  c5: { precio: 85000, nombre: "Candonga Hills G", nota: "Precio corregido: estaba en $850.000 (las demás candongas valen $65.000–$90.000 y el proveedor la vende en $80.000)" },
  p11: { nombre: "Pulsera Balín Italiana Nº 8" },
  p25: { nombre: "Pulsera Lisa o Diamantada" },
};

const GENERICOS = /^(pulsera|pulsera mas anillo|pulsera premium|pulsera niñ@)$/i;

const productos = [];
const usados = new Set();
for (const c of crudos) {
  const fix = CORRECCIONES[c.id] || {};
  const archivo = c.imagen.replace(/\.pngl$/, ".png").replace(/^imagenes\//, "");
  let categoria = c.categoria;
  let sub;
  let nombre = fix.nombre || c.nombre;
  let descripcion;
  let etiquetas = [];

  if (categoria === "topos" && /rosca/i.test(nombre)) sub = "rosca";
  if (categoria === "cadenas") {
    const largo = nombre.match(/(\d{2})\s*cm/i)?.[1];
    sub = { 40: "40", 45: "45", 50: "50-60", 60: "50-60", 65: "65" }[largo];
  }
  const ia = nombresPulseras[archivo];
  if (categoria === "pulseras" && ia && (GENERICOS.test(c.nombre.trim()) || !fix.nombre)) {
    if (GENERICOS.test(c.nombre.trim())) nombre = ia.nombre + (/premium/i.test(c.nombre) ? " Premium" : "");
    descripcion = `${ia.descripcion.trim()} Detalles en oro laminado 18K.`;
    etiquetas = (ia.tags || []).filter((t) => ["hombre", "niño", "set", "religiosa", "hilo"].includes(t));
    if (/tobillera/i.test(nombre)) categoria = "tobilleras";
  }
  if (c.nombre === "Pulsera niñ@" && !/niñ|infantil/i.test(nombre)) nombre += " Infantil";
  if (/niñ@/i.test(nombre)) nombre = nombre.replace(/niñ@/i, "Infantil");

  nombre = nombreComercial(nombre, categoria, sub);
  let slug = slugify(nombre);
  let n = 2;
  while (usados.has(slug)) slug = `${slugify(nombre)}-${n++}`;
  usados.add(slug);

  productos.push({
    id: `nv-${c.id}`,
    sku: `NV-${c.id.toUpperCase()}`,
    slug,
    nombre,
    categoria,
    ...(sub ? { sub } : {}),
    precio: fix.precio ?? c.precio,
    ...(descripcion ? { descripcion } : {}),
    ...(etiquetas.length ? { etiquetas } : {}),
    fotos: [{ src: `img/nv/${slug}.webp`, mini: `img/nv/${slug}-m.webp` }],
    _origen: path.join(ORIGEN, "imagenes", archivo),
    ...(fix.nota ? { nota: fix.nota } : {}),
  });
}

await enParalelo(
  productos.map((p) => async () => {
    await fotoGrande(p._origen, path.join("public", p.fotos[0].src), { calidad: 84 });
    await miniatura(p._origen, path.join("public", p.fotos[0].mini));
    await miniatura(p._origen, path.join("public", p.fotos[0].mini.replace(/-m\.webp$/, "-s.webp")), { ancho: 360, alto: 450, calidad: 76 });
    p.huella = await huella(p._origen);
  }),
  6,
);

for (const p of productos) delete p._origen;
await writeFile("data/nv-propios.json", JSON.stringify(productos, null, 2) + "\n");
console.log(`Productos propios migrados: ${productos.length}`);
for (const p of productos.filter((x) => x.nota)) console.log(`  ⚠ ${p.nombre}: ${p.nota}`);
