// Cliente mínimo de la API pública (Parse Server) que usa la tienda del proveedor para mostrar su catálogo.
// Los datos de conexión viven en data/privado/proveedor.json (no se sube a GitHub).
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const RUTA = "data/privado/proveedor.json";
if (!existsSync(RUTA)) {
  console.error(`Falta ${RUTA}. Copia data/proveedor.ejemplo.json a esa ruta y completa los datos del proveedor.`);
  process.exit(1);
}
export const PROVEEDOR = JSON.parse(readFileSync(RUTA, "utf8"));

const installationId = randomUUID();

export async function consultar(clase, cuerpo) {
  const body = {
    ...cuerpo,
    _method: "GET",
    _ApplicationId: PROVEEDOR.appId,
    _ClientVersion: "js8.6.0",
    _InstallationId: installationId,
  };
  for (let intento = 1; ; intento++) {
    try {
      const res = await fetch(PROVEEDOR.api + clase, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          Origin: PROVEEDOR.tienda,
          Referer: PROVEEDOR.tienda + "/",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${clase}`);
      return await res.json();
    } catch (err) {
      if (intento >= 4) throw err;
      await new Promise((r) => setTimeout(r, 1500 * intento));
    }
  }
}

const CAMPOS =
  "titulo,body,codigo,precio,image,subcategory,catalogos,tipo,estado,mostrar_catalogo,createdAt,updatedAt";

/** Todos los productos publicados en el catálogo del proveedor. */
export async function traerProductos() {
  const todos = [];
  for (let skip = 0; ; skip += 500) {
    const { results } = await consultar("Post", {
      where: { owner_post: PROVEEDOR.owner },
      keys: CAMPOS,
      limit: 500,
      skip,
      order: "createdAt",
    });
    todos.push(...results);
    if (results.length < 500) break;
  }
  return todos;
}

export async function traerCategorias() {
  const { results } = await consultar("Subcategory", {
    where: { owner: PROVEEDOR.owner, deletedAt: { $exists: false } },
    limit: 200,
    order: "sort",
  });
  return results;
}
