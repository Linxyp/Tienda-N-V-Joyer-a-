// Comprime de antemano en Brotli las páginas, scripts y datos del sitio exportado, para que el servidor
// los entregue ya comprimidos sin gastar CPU en cada visita (Caddy: file_server { precompressed br }).
// Las imágenes WebP no se tocan: ya vienen comprimidas.
//
//   node scripts/precomprimir.mjs out
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { brotliCompress, constants } from "node:zlib";
import { enParalelo } from "./lib/descargas.mjs";

const brotli = promisify(brotliCompress);
const raiz = path.resolve(process.argv[2] || "out");
const COMPRIMIBLES = /\.(html|js|css|txt|json|svg|xml|webmanifest)$/i;
// Por debajo de ~1 KB la compresión no compensa
const MINIMO = 1024;

async function* recorrer(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) yield* recorrer(ruta);
    else if (COMPRIMIBLES.test(e.name)) yield ruta;
  }
}

const archivos = [];
for await (const f of recorrer(raiz)) archivos.push(f);

let antes = 0;
let despues = 0;
let hechos = 0;
await enParalelo(
  archivos.map((f) => async () => {
    const datos = await readFile(f);
    if (datos.length < MINIMO) return;
    const comprimido = await brotli(datos, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11,
        [constants.BROTLI_PARAM_SIZE_HINT]: datos.length,
      },
    });
    antes += datos.length;
    despues += comprimido.length;
    hechos++;
    await writeFile(`${f}.br`, comprimido);
  }),
  8,
);
console.log(
  `precomprimir: ${hechos} archivos · ${(antes / 1e6).toFixed(1)} MB → ${(despues / 1e6).toFixed(1)} MB en Brotli`,
);
