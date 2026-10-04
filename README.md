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
| `npm run importar-balines` | Genera la sección *Pulseras en balines* desde la exportación de Telegram (ver abajo) |
| `npm run desplegar` | Publica la tienda en el servidor de Lux IA: **https://nvjoyeria.lux-ia.com** |

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
  - `proveedor.json`: datos de conexión a la tienda del proveedor y el **margen** que se suma a cada precio. Si
    cambias el margen, ejecuta `npm run importar` para recalcular los precios.
  - `reporte-proveedor.csv`: referencia, costo del proveedor, precio N&V y bodega (Cali/Medellín) de cada producto.
    Ábrelo en Excel para ubicar rápido un pedido con el proveedor.
  - `balines.json` y `reporte-balines.csv`: la selección de *Pulseras en balines* (con su margen) y el reporte con
    mayorista, detal, precio N&V y enlace a cada publicación de Telegram.
  - `servidor/`: archivos e instrucciones para publicar en el servidor de Lux IA (`npm run desplegar`).
  Haz una copia de esta carpeta en un lugar seguro: si la pierdes, el importador no sabrá a qué tienda conectarse
  (puedes recrearla desde `data/proveedor.ejemplo.json`).

La referencia que ve el cliente (`Ref. NV-…`) es el **mismo código de fábrica que usa el proveedor** (por ejemplo
`NV-30065` corresponde a su producto `…-30065_…`); también en tus productos que él vende. Así, cuando te llega un pedido
por WhatsApp, lo pides igual al proveedor. Tus piezas de otra línea (por ejemplo las pulseras de hilo) conservan su
referencia propia (`NV-P23`, `NV-T1`…). Ni el costo, ni el margen, ni la tienda del proveedor aparecen en la web ni en
los archivos que se suben a GitHub.

## Pulseras en balines

Sección propia (`/tienda/balines/`) con las pulseras tejidas a mano: tus 70 pulseras tejidas de siempre
(`NV-P11` a `NV-P80`, con tu precio) más una **selección de las más vendidas** del grupo de Telegram del proveedor de
balinería, con precio = **precio al detal + tu margen** (configurado en `data/privado/balines.json`).

1. En Telegram Desktop: el grupo → ⋮ → *Exportar historial del chat* → marcar solo **Fotos**, formato **JSON**.
2. `npm run importar-balines -- --candidatos` → ordena las pulseras por popularidad (cuántas veces el proveedor las
   volvió a publicar, reacciones, "la más vendida", que sean recientes y de precio fácil) y arma hojas de contacto
   en `.cache/balines/hojas/` para escoger.
3. Anota las escogidas en `data/privado/balines.json` (número de publicación, nombre, descripción, colores del
   tejido, si lleva iniciales…). El orden de esa lista es el orden "más vendidas primero" de la web.
4. `npm run importar-balines` → optimiza las fotos (`public/img/b/`) y escribe `data/balines.json`.

La referencia de cada una es `NV-B` + el número de la publicación en Telegram. En
`data/privado/reporte-balines.csv` (solo en tu computador) está el precio mayorista, el detal, tu precio y el
**enlace directo a la publicación** para pedírsela al proveedor.

## Cambiar datos del negocio

Todo está en `src/config/tienda.ts`: número de WhatsApp, métodos de pago, ciudad, garantía y textos de confianza.
Las categorías y sus textos están en `src/config/categorias.ts`.

## Publicar

### Servidor de Lux IA (publicación principal): https://nvjoyeria.lux-ia.com
`npm run desplegar` compila la tienda para ese dominio, la comprime en Brotli (`scripts/precomprimir.mjs`) y la sube
al servidor. Las instrucciones y archivos del servidor están en `data/privado/servidor/` (solo en tu computador:
describen infraestructura que no debe quedar pública).

### Opción 1: Vercel
1. Sube este proyecto a un repositorio de GitHub.
2. En vercel.com → *Add New Project* → importa el repositorio → *Deploy*. No hay que configurar nada más.
3. Si usas dominio propio, agrega en Vercel la variable `NEXT_PUBLIC_SITE_URL` con tu dominio (ej.
   `https://nvjoyeria.com`) para que los enlaces al compartir en WhatsApp/Facebook muestren la foto correcta.

### Opción 2: GitHub Pages (copia de respaldo, se actualiza sola)
La tienda está publicada en **https://linxyp.github.io/Tienda-N-V-Joyer-a-/** desde el repositorio
`Linxyp/Tienda-N-V-Joyer-a-`. El flujo `.github/workflows/publicar.yml` la vuelve a publicar solo cada vez que subes
cambios a la rama `main` (tarda unos 3 minutos; el avance se ve en la pestaña *Actions* del repositorio).

Para actualizar después de importar o editar productos:

```bash
npm run importar        # opcional: trae productos/precios nuevos del proveedor
git add -A
git commit -m "Actualizo catálogo"
git push
```

El catálogo anterior (el HTML con las 122 joyas) quedó guardado en la rama **`catalogo-anterior`** del mismo
repositorio, por si algún día necesitas consultarlo o restaurarlo.

## Nota para Windows

- Se usa Next.js **16.3.1** porque el Control de aplicaciones de Windows bloquea el binario nativo de versiones más
  nuevas en este equipo. Si actualizas Next y el build falla con "Application Control policy has blocked this file",
  vuelve a la 16.3.1.
- `npm run build` ejecuta `scripts/postbuild.mjs`, que corrige un detalle de Next en Windows con los archivos de
  precarga de la navegación. En Linux (Vercel/GitHub) no hace nada.
