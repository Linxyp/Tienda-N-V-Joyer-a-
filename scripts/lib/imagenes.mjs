import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

sharp.cache(false);

async function masNuevo(destino, origen) {
  try {
    const [d, o] = await Promise.all([stat(destino), stat(origen)]);
    return d.mtimeMs >= o.mtimeMs && d.size > 0;
  } catch {
    return false;
  }
}

/**
 * Foto de la ficha: WebP de máximo 900 px de ancho y 1280 px de alto (en la ficha se ve a ~560 px, así queda
 * nítida en Retina sin pesar de más). Si ya es un WebP liviano dentro de ese tamaño, se copia tal cual.
 */
export async function fotoGrande(origen, destino, { maxAncho = 900, maxAlto = 1280, calidad = 78 } = {}) {
  if (await masNuevo(destino, origen)) return destino;
  await mkdir(path.dirname(destino), { recursive: true });
  const meta = await sharp(origen).metadata();
  const s = await stat(origen);
  if (meta.format === "webp" && meta.width <= maxAncho && meta.height <= maxAlto && s.size < 140_000) {
    await copyFile(origen, destino);
  } else {
    const codificar = (q) =>
      sharp(origen)
        .rotate()
        .resize({ width: maxAncho, height: maxAlto, fit: "inside", withoutEnlargement: true })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
    let buf = await codificar(calidad);
    // Fotos con mucho grano/detalle: se baja un poco la calidad para que no pesen más de ~150 KB
    if (buf.length > 150_000) buf = await codificar(Math.min(calidad, 68));
    await writeFile(destino, buf);
  }
  return destino;
}

/**
 * Miniatura 4:5 para las tarjetas del catálogo, recortada donde está la joya (estrategia "attention").
 * 640×800 se ve nítida en pantallas Retina; si la foto original es más pequeña no se agranda.
 */
export async function miniatura(origen, destino, { ancho = 640, alto = 800, calidad = 78 } = {}) {
  if (await masNuevo(destino, origen)) return destino;
  await mkdir(path.dirname(destino), { recursive: true });
  // Si la foto es más pequeña que la miniatura, se usa el recuadro 4:5 más grande que quepa en ella
  const { width = ancho, height = alto } = await sharp(origen).metadata();
  const escala = Math.min(1, width / ancho, height / alto);
  await sharp(origen)
    .rotate()
    .resize(Math.round(ancho * escala), Math.round(alto * escala), { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: calidad, effort: 5 })
    .toFile(destino);
  return destino;
}

/** Huella perceptual (dHash 64 bits) para detectar fotos repetidas. */
export async function huella(origen) {
  const data = await sharp(origen).greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer();
  let bits = 0n;
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) bits = (bits << 1n) | (data[y * 9 + x] > data[y * 9 + x + 1] ? 1n : 0n);
  return bits.toString(16).padStart(16, "0");
}

export function distancia(a, b) {
  let x = BigInt("0x" + a) ^ BigInt("0x" + b);
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}
