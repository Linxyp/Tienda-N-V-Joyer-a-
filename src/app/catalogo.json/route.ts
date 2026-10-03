import { productos, resumen } from "@/lib/catalogo";

// Índice compacto del catálogo (buscador y filtros). Se genera como archivo estático en el build.
export const dynamic = "force-static";

export function GET() {
  return Response.json(productos().map(resumen));
}
