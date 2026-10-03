# N&V Joyería — tienda online

Tienda de joyería en oro laminado 18K hecha con **Next.js 16 + React 19 + Tailwind CSS 4**, con escena 3D en
**React Three Fiber**, animaciones con **Motion** y carrito con **Zustand**. Los pedidos se envían al WhatsApp de la
tienda y el cliente paga con **Nequi, Daviplata o Llave Bre-B** (todo al 313 260 2527).

El sitio se genera como archivos estáticos (`out/`): no necesita servidor ni base de datos y se publica gratis en
Vercel o GitHub Pages.

## Comandos

| Comando | Para qué sirve |
| --- | --- |
| `npm install` | Instala dependencias (la primera vez). |
| `npm run dev` | Abre la tienda en modo desarrollo en http://localhost:3000 |
| `npm run build` | Genera la tienda lista para publicar en la carpeta `out/` |
| `npm start` | Sirve la carpeta `out/` para revisarla antes de publicar |
| `npm run importar` | Actualiza el catálogo desde la tienda del proveedor (precios, productos nuevos y fotos) |

## Cómo se arma el catálogo

- `data/nv-propios.json` — tus productos propios (los 122 del catálogo anterior), con tu precio.
- `data/proveedor.json` — productos importados del proveedor, ya con su precio de venta. **No editar a mano**: se
  regenera con `npm run importar`.
- `data/ajustes.json` — tus ajustes, que se respetan aunque vuelvas a importar:
  - `ocultar`: lista de ids, referencias (`NV-…`) o slugs que no quieres mostrar.
  - `precios`: precio fijo para un producto, por ejemplo `{ "NV-34253": 99000 }`.
  - `nombres`: nombre a mano para un producto.
  - `destacados`: productos que quieres primero en "Destacados".
- `data/coincidencias.json` — productos del proveedor que ya tenías en tu catálogo (verificados por foto). Esos no se
  duplican: conservan tu precio y suman las fotos del proveedor a su galería.
- `data/privado/` — **solo en tu computador, no se sube a GitHub**:
  - `proveedor.json`: datos de conexión a la tienda del proveedor y el **margen** que se suma a cada precio (hoy
    `15000`). Si cambias el margen, ejecuta `npm run importar` para recalcular los precios.
  - `reporte-proveedor.csv`: referencia, costo del proveedor, precio N&V y bodega (Cali/Medellín) de cada producto.
    Ábrelo en Excel para ubicar rápido un pedido con el proveedor.
  Haz una copia de esta carpeta en un lugar seguro: si la pierdes, el importador no sabrá a qué tienda conectarse
  (puedes recrearla desde `data/proveedor.ejemplo.json`).

La referencia que ve el cliente (`Ref. NV-…`) es el código de fábrica de la pieza: así, cuando te llega un pedido por
WhatsApp, lo encuentras directo en el reporte. Ni el costo, ni el margen, ni la tienda del proveedor aparecen en la web
ni en los archivos que se suben a GitHub.

## Cambiar datos del negocio

Todo está en `src/config/tienda.ts`: número de WhatsApp, métodos de pago, ciudad, garantía y textos de confianza.
Las categorías y sus textos están en `src/config/categorias.ts`.

## Publicar

### Opción 1: Vercel (recomendada)
1. Sube este proyecto a un repositorio de GitHub.
2. En vercel.com → *Add New Project* → importa el repositorio → *Deploy*. No hay que configurar nada más.
3. Si usas dominio propio, agrega en Vercel la variable `NEXT_PUBLIC_SITE_URL` con tu dominio (ej.
   `https://nvjoyeria.com`) para que los enlaces al compartir en WhatsApp/Facebook muestren la foto correcta.

### Opción 2: GitHub Pages (donde está hoy el catálogo)
El flujo `.github/workflows/publicar.yml` publica solo cada vez que subes cambios a la rama `main`.
1. Sube el proyecto al repositorio `linxyp/Tienda-N-V-Joyer-a-` (reemplazando el catálogo anterior).
2. En GitHub → *Settings* → *Pages* → *Source*: **GitHub Actions**.
3. La tienda queda en https://linxyp.github.io/Tienda-N-V-Joyer-a-/

## Nota para Windows

- Se usa Next.js **16.3.1** porque el Control de aplicaciones de Windows bloquea el binario nativo de versiones más
  nuevas en este equipo. Si actualizas Next y el build falla con "Application Control policy has blocked this file",
  vuelve a la 16.3.1.
- `npm run build` ejecuta `scripts/postbuild.mjs`, que corrige un detalle de Next en Windows con los archivos de
  precarga de la navegación. En Linux (Vercel/GitHub) no hace nada.
