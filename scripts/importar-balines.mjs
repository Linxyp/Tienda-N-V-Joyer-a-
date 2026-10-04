// Sección "Pulseras en balines": se importa del grupo de difusión de Telegram del proveedor de balinería.
//
// 1. En Telegram Desktop: abrir el grupo → ⋮ → Exportar historial del chat → marcar solo "Fotos", formato JSON.
// 2. npm run importar-balines -- --candidatos
//      Ordena las pulseras por lo que más se vende (cuántas veces el proveedor ha vuelto a publicar el diseño,
//      reacciones, "la más vendida", que sea reciente y de precio fácil de comprar) y arma hojas de contacto
//      en .cache/balines/ para escoger.
// 3. Anotar las escogidas en data/privado/balines.json → "seleccion" (número de publicación, nombre, descripción…).
// 4. npm run importar-balines
//      Optimiza las fotos en public/img/b/ y escribe data/balines.json con precio = DETAL + margen
//      ("margen" en data/privado/balines.json).
//      El reporte privado (data/privado/reporte-balines.csv) trae mayorista, detal y el enlace a cada publicación.
//
// Otra exportación:  npm run importar-balines -- --carpeta "C:\…\ChatExport_2026-10-04"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { enParalelo } from "./lib/descargas.mjs";
import { fotoGrande, huella, miniatura } from "./lib/imagenes.mjs";
import { sinTildes, slugify } from "./lib/normalizar.mjs";

const args = process.argv.slice(2);
const opcion = (nombre) => {
  const i = args.indexOf(nombre);
  return i >= 0 ? args[i + 1] : undefined;
};
const CANDIDATOS = args.includes("--candidatos");

const CONFIG = "data/privado/balines.json";
const config = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, "utf8")) : { seleccion: [] };
const margen = Number(config.margen ?? 0);
const CACHE = ".cache/balines";
const SALIDA = "public/img/b";

// ---------------------------------------------------------------------------
// 1. Exportación
function exportacionMasReciente() {
  const base = path.join(os.homedir(), "Downloads", "Telegram Desktop");
  if (!existsSync(base)) return null;
  return (
    readdirSync(base)
      .filter((n) => n.startsWith("ChatExport") && existsSync(path.join(base, n, "result.json")))
      .map((n) => path.join(base, n))
      .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0] ?? null
  );
}
const carpeta = opcion("--carpeta") ?? exportacionMasReciente();
if (!carpeta || !existsSync(path.join(carpeta, "result.json"))) {
  console.error("No encontré la exportación de Telegram (carpeta ChatExport_… con result.json).");
  process.exit(1);
}
const chat = JSON.parse(readFileSync(path.join(carpeta, "result.json"), "utf8"));
console.log(`Exportación: ${chat.name} · ${chat.messages.length} mensajes`);
const enlace = (post) => `https://t.me/c/${chat.id}/${post}`;

// ---------------------------------------------------------------------------
// 2. Publicaciones: las fotos de un álbum llegan como mensajes seguidos del mismo autor en el mismo segundo;
//    el texto (con los precios) viene en una de ellas o en un mensaje aparte justo después.
const textoDe = (m) =>
  (Array.isArray(m.text) ? m.text.map((t) => (typeof t === "string" ? t : t.text)).join("") : m.text || "")
    .split("\n")
    .map((l) =>
      l
        .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu, "")
        .replace(/[*_~]+/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const reaccionesDe = (m) => (m.reactions ?? []).reduce((s, r) => s + (r.count ?? 0), 0);

const publicaciones = [];
for (const m of chat.messages) {
  if (m.type !== "message") continue;
  const t = Number(m.date_unixtime);
  const texto = textoDe(m);
  const ultima = publicaciones.at(-1);
  const mismoAutor = ultima?.autor === m.from_id;
  if (m.photo && !m.photo.startsWith("(")) {
    const foto = { archivo: m.photo, ancho: m.width, alto: m.height };
    if (ultima && mismoAutor && t - ultima.tFin <= 2 && !(texto && ultima.texto)) {
      ultima.fotos.push(foto);
      ultima.tFin = t;
      ultima.reacciones += reaccionesDe(m);
      if (texto) Object.assign(ultima, { texto, post: m.id });
    } else {
      publicaciones.push({
        post: m.id,
        fecha: m.date,
        autor: m.from_id,
        fotos: [foto],
        texto,
        tFin: t,
        reacciones: reaccionesDe(m),
      });
    }
  } else if (texto && ultima && mismoAutor && t - ultima.tFin <= 90 && !ultima.texto) {
    Object.assign(ultima, { texto, post: m.id, tFin: t });
    ultima.reacciones += reaccionesDe(m);
  }
}

// ---------------------------------------------------------------------------
// 3. Precios. Cada línea trae uno ("PRECIO DETAL $70.000", "Detal: 260.000", "$235.000 DETAL", "Precio my: $41.000").
//    Si la publicación trae varios diseños (p. ej. 4, 6 y 8 mm), cada par mayor/detal es una variante.
const DETAL = /detal/;
const MAYOR = /mayor\w*|\bmy\b/;

function pesos(tramo) {
  const m = tramo.replace(/\d+(?:[.,]\d+)?\s*mm/gi, "").match(/(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d{1,2})?)\s*(k\b|mil\b)?/i);
  if (!m) return null;
  let n = Number(m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."));
  if (m[2] || n < 1000) n *= 1000;
  return n >= 10_000 && n <= 3_000_000 ? Math.round(n) : null;
}

function precioEn(linea, palabra) {
  const l = sinTildes(linea.toLowerCase());
  const i = l.search(palabra);
  if (i < 0) return null;
  const despues = l.slice(i).replace(palabra, "");
  const corte = despues.search(/detal|mayor|\bmy\b/);
  return pesos(corte >= 0 ? despues.slice(0, corte) : despues) ?? pesos(l.slice(0, i));
}

function variantes(texto) {
  const lista = [];
  let actual = { lineas: [] };
  for (const linea of texto.split("\n")) {
    const l = sinTildes(linea.toLowerCase());
    const detal = DETAL.test(l) ? precioEn(linea, DETAL) : null;
    const mayor = MAYOR.test(l) ? precioEn(linea, MAYOR) : null;
    if (detal || mayor) {
      if (detal) actual.detal = detal;
      if (mayor) actual.mayor = mayor;
      continue;
    }
    if (actual.detal && linea.trim()) {
      lista.push(actual);
      actual = { lineas: [] };
    }
    if (linea.trim()) actual.lineas.push(linea);
  }
  if (actual.detal) lista.push(actual);
  return lista;
}

// ---------------------------------------------------------------------------
// 4. Qué es cada publicación
const PULSERA = /\b(pulseras?|manillas?|brazaletes?)\b/;
const OTRO = /\b(anillos?|denarios?|tobilleras?|collar(es)?|cadenas?|choker|gargantillas?|aretes?|topos?|candongas?|llaveros?|rosarios?|tutorial|curso|paquete)\b/;
// Sin la palabra "manilla": basta con que traiga balines y un tejido (si no, suele ser un herraje o insumo suelto)
const TEJIDO = /\b(macrame|francis?cano|fransiscano|tejid[oa]|nudos|abrazado|cruzado|triple|doble|adn|hilos)\b/;
const BALINES = /\b(balin(es)?|balinws|b|lisos?|italy|italian[oa]s?|neo(prenos?)?|aceros?|punteras?)\b/;
const REGIONAL = /solo (disponible|en (medellin|cali|bogota))|disponible solo|solamente en/;
const ELOGIO = /mas vendid|mas pedid|top seller|top 3|top ventas|favorit[ao]s? de|una de las favoritas|se agotan|la mas buscad/;

function tipo(texto) {
  const t = sinTildes(texto.toLowerCase());
  if (PULSERA.test(t)) return "pulsera";
  if (OTRO.test(t)) return "otro";
  return TEJIDO.test(t) && BALINES.test(t) ? "posible" : "otro";
}

// En publicaciones con varios diseños, solo cuentan las variantes que son pulsera (no el anillo del combo)
const varianteDePulsera = (v) => {
  const t = sinTildes(v.lineas.join(" ").toLowerCase());
  return PULSERA.test(t) || !OTRO.test(t);
};

// Firma del diseño (para reconocer cuando el proveedor vuelve a publicar la misma pulsera con otra foto)
const VACIAS = new Set(
  "con de del la el los las y en para tu te un una mas por elaborada elaborado elaboradas elaborados manilla manillas hermosa hermoso hermosas cada precio valor unidad c u".split(
    " ",
  ),
);
function firma(v) {
  const tokens = sinTildes(v.lineas.join(" ").toLowerCase())
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w && !VACIAS.has(w));
  return tokens.some((w) => /\d/.test(w)) && tokens.length >= 4 ? [...tokens].sort().join(" ") : null;
}

const conPrecio = [];
for (const p of publicaciones) {
  const vs = variantes(p.texto).filter(varianteDePulsera);
  if (!vs.length) continue;
  const t = sinTildes(p.texto.toLowerCase());
  conPrecio.push({
    ...p,
    variantes: vs,
    tipo: tipo(p.texto),
    regional: REGIONAL.test(t),
    elogio: ELOGIO.test(t),
    porUnidad: /por unidad|c\/u|cada (una|manilla)/.test(t),
    firmas: vs.map(firma).filter(Boolean),
  });
}
console.log(`Publicaciones con fotos: ${publicaciones.length} · con precio al detal: ${conPrecio.length}`);

// ---------------------------------------------------------------------------
// 5. Huellas de las fotos (caché) para encontrar fotos repetidas entre publicaciones
await mkdir(CACHE, { recursive: true });
const RUTA_HUELLAS = path.join(CACHE, "huellas.json");
const huellas = existsSync(RUTA_HUELLAS) ? JSON.parse(readFileSync(RUTA_HUELLAS, "utf8")) : {};
const pendientes = [...new Set(conPrecio.flatMap((p) => p.fotos.map((f) => f.archivo)))].filter((a) => !huellas[a]);
if (pendientes.length) {
  console.log(`Calculando huellas de ${pendientes.length} fotos…`);
  await enParalelo(
    pendientes.map((a) => async () => {
      try {
        huellas[a] = await huella(path.join(carpeta, a));
      } catch {
        huellas[a] = null;
      }
    }),
    8,
  );
  await writeFile(RUTA_HUELLAS, JSON.stringify(huellas));
}

const bits = (h) => [parseInt(h.slice(0, 8), 16), parseInt(h.slice(8), 16)];
const unos = (n) => {
  n -= (n >>> 1) & 0x55555555;
  n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
  return (((n + (n >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
};
const distancia = (a, b) => unos((a[0] ^ b[0]) >>> 0) + unos((a[1] ^ b[1]) >>> 0);

// ---------------------------------------------------------------------------
// 6. Grupos del mismo diseño (misma foto o misma lista de materiales) → cuántas veces se ha publicado
const padre = conPrecio.map((_, i) => i);
const raiz = (i) => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
const unir = (a, b) => (padre[raiz(a)] = raiz(b));

const porFirma = new Map();
conPrecio.forEach((p, i) =>
  p.firmas.forEach((f) => {
    if (porFirma.has(f)) unir(i, porFirma.get(f));
    else porFirma.set(f, i);
  }),
);
const fotosH = conPrecio.flatMap((p, i) =>
  p.fotos.filter((f) => huellas[f.archivo]).map((f) => ({ i, h: bits(huellas[f.archivo]) })),
);
for (let a = 0; a < fotosH.length; a++)
  for (let b = a + 1; b < fotosH.length; b++)
    if (fotosH[a].i !== fotosH[b].i && distancia(fotosH[a].h, fotosH[b].h) <= 3) unir(fotosH[a].i, fotosH[b].i);

const grupos = new Map();
conPrecio.forEach((p, i) => grupos.set(raiz(i), [...(grupos.get(raiz(i)) ?? []), p]));

const HOY = Date.parse(chat.messages.at(-1).date);
const meses = (fecha) => (HOY - Date.parse(fecha)) / (30.4 * 864e5);

function puntaje(c) {
  const precio = c.detal;
  const pPrecio =
    precio <= 80_000 ? 2 : precio <= 110_000 ? 1.8 : precio <= 140_000 ? 1.2 : precio <= 180_000 ? 0.6 : precio <= 240_000 ? 0 : -1.5;
  const m = meses(c.ultima);
  const pReciente = m <= 3 ? 2 : m <= 6 ? 1.5 : m <= 12 ? 1 : 0;
  const alto = Math.max(...c.fotos.map((f) => f.alto ?? 0));
  return (
    2.2 * (c.veces - 1) +
    Math.min(c.reacciones, 6) +
    (c.elogio ? 2.5 : 0) +
    pReciente +
    pPrecio +
    (alto >= 1600 ? 0.5 : 0) +
    (c.fotos.length >= 2 ? 0.3 : 0)
  );
}

// Cada grupo se representa con su publicación más reciente (precio y fotos más actuales)
const candidatos = [...grupos.values()]
  .map((g) => {
    const orden = [...g].sort((a, b) => b.fecha.localeCompare(a.fecha));
    const p = orden.find((x) => x.tipo !== "otro") ?? orden[0];
    const dias = new Set(g.map((x) => x.fecha.slice(0, 10)));
    const c = {
      post: p.post,
      fecha: p.fecha,
      ultima: orden[0].fecha,
      primera: orden.at(-1).fecha,
      veces: dias.size,
      otras: orden.filter((x) => x !== p).map((x) => x.post),
      reacciones: g.reduce((s, x) => s + x.reacciones, 0),
      elogio: g.some((x) => x.elogio),
      tipo: p.tipo,
      regional: p.regional,
      porUnidad: p.porUnidad,
      detal: Math.min(...p.variantes.map((v) => v.detal)),
      mayor: p.variantes.find((v) => v.detal === Math.min(...p.variantes.map((w) => w.detal)))?.mayor ?? null,
      nVariantes: p.variantes.length,
      fotos: p.fotos,
      texto: p.texto,
    };
    return { ...c, puntaje: Math.round(puntaje(c) * 100) / 100 };
  })
  .filter((c) => c.tipo !== "otro" && !c.regional)
  .sort((a, b) => b.puntaje - a.puntaje);

if (CANDIDATOS) {
  await hojasDeContacto(candidatos);
  process.exit(0);
}
await generar();

// ---------------------------------------------------------------------------
// Hojas de contacto para escoger (12 por hoja, con número de publicación, precio y puntaje)
async function hojasDeContacto(lista) {
  const N = Number(opcion("--cuantos") ?? 120);
  const top = lista.slice(0, N);
  const dir = path.join(CACHE, "hojas");
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const [W, H, R, COLS, FILAS] = [360, 450, 64, 4, 3];
  const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  for (let h = 0; h * COLS * FILAS < top.length; h++) {
    const lote = top.slice(h * COLS * FILAS, (h + 1) * COLS * FILAS);
    const capas = await Promise.all(
      lote.flatMap((c, k) => {
        const x = (k % COLS) * W;
        const y = Math.floor(k / COLS) * (H + R);
        const etiqueta = Buffer.from(
          `<svg width="${W}" height="${R}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111"/>` +
            `<text x="10" y="26" font-family="Arial" font-size="22" font-weight="bold" fill="#f0dca0">#${c.post} · $${(c.detal / 1000).toFixed(0)}k${c.nVariantes > 1 ? ` (${c.nVariantes} var)` : ""}</text>` +
            `<text x="10" y="54" font-family="Arial" font-size="18" fill="#ddd">${escapar(`p ${c.puntaje} · ${c.veces}x · ${c.fotos.length} fotos · ${c.fecha.slice(0, 7)}${c.elogio ? " ★" : ""}`)}</text></svg>`,
        );
        return [
          sharp(path.join(carpeta, c.fotos[0].archivo))
            .rotate()
            .resize(W, H, { fit: "cover", position: sharp.strategy.attention })
            .toBuffer()
            .then((input) => ({ input, left: x, top: y })),
          Promise.resolve({ input: etiqueta, left: x, top: y + H }),
        ];
      }),
    );
    await sharp({ create: { width: W * COLS, height: (H + R) * FILAS, channels: 3, background: "#000" } })
      .composite(capas)
      .jpeg({ quality: 72 })
      .toFile(path.join(dir, `hoja-${String(h + 1).padStart(2, "0")}.jpg`));
  }
  await writeFile(
    path.join(CACHE, "candidatos.json"),
    JSON.stringify(
      top.map(({ fotos, ...c }) => ({ ...c, fotos: fotos.map((f) => f.archivo) })),
      null,
      1,
    ),
  );
  console.log(`${lista.length} candidatas · top ${top.length} en ${dir} y ${path.join(CACHE, "candidatos.json")}`);
}

// ---------------------------------------------------------------------------
// Generar la sección con la selección de data/privado/balines.json
async function generar() {
  const seleccion = config.seleccion ?? [];
  if (!margen) {
    console.error(`Falta "margen" (lo que se suma al precio al detal) en ${CONFIG}.`);
    process.exit(1);
  }
  if (!seleccion.length) {
    console.error(`No hay pulseras escogidas en ${CONFIG} ("seleccion"). Corre primero con --candidatos.`);
    process.exit(1);
  }
  const porPost = new Map(conPrecio.map((p) => [p.post, p]));
  const usados = new Set();
  const productos = [];
  const reporte = [["Ref", "Nombre", "Precio mayorista", "Precio detal", "Precio N&V", "Publicado", "Enlace", "Texto"]];

  for (const [i, s] of seleccion.entries()) {
    const p = porPost.get(s.post);
    if (!p) {
      console.warn(`  ⚠ La publicación ${s.post} no está en la exportación (o no tiene precio).`);
      continue;
    }
    const v = p.variantes[s.variante ?? 0];
    const detal = s.detal ?? v.detal;
    let slug = slugify(s.nombre);
    for (let n = 2; usados.has(slug); n++) slug = `${slugify(s.nombre)}-${n}`;
    usados.add(slug);
    const orden = s.fotos ?? p.fotos.map((_, k) => k);
    const fotos = orden.slice(0, 5).map((k, j) => ({
      _origen: path.join(carpeta, p.fotos[k].archivo),
      src: `img/b/${slug}-${j + 1}.webp`,
      ...(j < 2 ? { mini: `img/b/${slug}-${j + 1}-m.webp` } : {}),
    }));
    productos.push({
      id: `b-${s.post}`,
      sku: `NV-B${s.post}`,
      slug,
      nombre: s.nombre,
      descripcion: s.descripcion,
      precio: detal + margen,
      etiquetas: s.etiquetas ?? [],
      ...(s.colores?.length ? { colores: s.colores } : {}),
      ...(s.letra ? { letra: s.letra } : {}),
      caracteristicas: s.caracteristicas ?? [],
      fotos,
      creado: p.fecha.slice(0, 10),
      prioridad: seleccion.length - i,
    });
    reporte.push([
      `NV-B${s.post}`,
      s.nombre,
      v.mayor ?? "",
      detal,
      detal + margen,
      p.fecha.slice(0, 10),
      enlace(s.post),
      p.texto.replace(/\s*\n\s*/g, " / "),
    ]);
  }

  console.log(`Optimizando fotos de ${productos.length} pulseras…`);
  await mkdir(SALIDA, { recursive: true });
  const tareas = productos.flatMap((p) =>
    p.fotos.map((f) => async () => {
      await fotoGrande(f._origen, path.join("public", f.src));
      if (f.mini) {
        await miniatura(f._origen, path.join("public", f.mini));
        await miniatura(f._origen, path.join("public", f.mini.replace(/-m\.webp$/, "-s.webp")), {
          ancho: 360,
          alto: 450,
          calidad: 76,
        });
      }
    }),
  );
  await enParalelo(tareas, 6, (n, t) => n % 20 === 0 && console.log(`  ${n}/${t}`));

  // Fotos que ya no se usan (pulseras quitadas de la selección)
  const vigentes = new Set(
    productos.flatMap((p) => p.fotos.flatMap((f) => [f.src, f.mini, f.mini?.replace(/-m\.webp$/, "-s.webp")])).filter(Boolean),
  );
  for (const archivo of await readdir(SALIDA))
    if (!vigentes.has(`img/b/${archivo}`)) await rm(path.join(SALIDA, archivo));

  const limpios = productos.map((p) => ({ ...p, fotos: p.fotos.map(({ _origen, ...f }) => f) }));
  await writeFile("data/balines.json", JSON.stringify(limpios, null, 1) + "\n");
  const csv = reporte.map((fila) => fila.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  await writeFile("data/privado/reporte-balines.csv", String.fromCharCode(0xfeff) + csv);
  console.log(`Listo: ${limpios.length} pulseras en data/balines.json · reporte privado en data/privado/reporte-balines.csv`);
}
