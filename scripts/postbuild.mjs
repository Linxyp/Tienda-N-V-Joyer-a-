// Ajuste posterior a `next build` (output: "export").
//
// En Windows, Next 16 escribe los archivos de precarga por segmento con "\" y quedan en carpetas
// (out/tienda/__next.tienda/$d$categoria/__PAGE__.txt), pero el navegador los pide con puntos
// (out/tienda/__next.tienda.$d$categoria.__PAGE__.txt). Sin esto la navegación interna da 404
// al probar el sitio exportado desde Windows. En Linux (Vercel, GitHub Actions) no hace nada.
import { readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("out");

async function archivos(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await archivos(p)));
    else out.push(p);
  }
  return out;
}

async function corregir(dir) {
  let movidos = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (e.name.startsWith("__next.")) {
      for (const f of await archivos(p)) {
        const relativo = path.relative(dir, f).split(path.sep).join(".");
        await rename(f, path.join(dir, relativo));
        movidos++;
      }
      await rm(p, { recursive: true, force: true });
    } else if (e.name !== "_next" && e.name !== "img") {
      movidos += await corregir(p);
    }
  }
  return movidos;
}

try {
  await stat(OUT);
} catch {
  console.error("No existe la carpeta out/. Ejecuta primero `next build`.");
  process.exit(1);
}
const n = await corregir(OUT);
console.log(n ? `postbuild: ${n} archivos de precarga renombrados` : "postbuild: nada que ajustar");
