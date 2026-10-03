import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/** Descarga `url` a `destino` si no existe ya (caché simple por nombre de archivo). */
export async function descargar(url, destino) {
  try {
    const s = await stat(destino);
    if (s.size > 0) return { destino, nuevo: false };
  } catch {}
  await mkdir(path.dirname(destino), { recursive: true });
  for (let intento = 1; ; intento++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      await writeFile(destino, Buffer.from(await res.arrayBuffer()));
      return { destino, nuevo: true };
    } catch (err) {
      if (intento >= 4) throw err;
      await new Promise((r) => setTimeout(r, 1000 * intento));
    }
  }
}

/** Ejecuta `tareas` (funciones async) con un máximo de `limite` en paralelo. */
export async function enParalelo(tareas, limite = 8, alAvanzar) {
  const resultados = new Array(tareas.length);
  let siguiente = 0;
  let hechas = 0;
  async function trabajador() {
    while (siguiente < tareas.length) {
      const i = siguiente++;
      resultados[i] = await tareas[i]();
      hechas++;
      alAvanzar?.(hechas, tareas.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limite, tareas.length) }, trabajador));
  return resultados;
}
