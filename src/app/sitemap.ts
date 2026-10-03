import type { MetadataRoute } from "next";
import { CATEGORIAS } from "@/config/categorias";
import { TIENDA } from "@/config/tienda";
import { productos } from "@/lib/catalogo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = TIENDA.url.replace(/\/$/, "");
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tienda/`, changeFrequency: "weekly", priority: 0.9 },
    ...CATEGORIAS.map((c) => ({ url: `${base}/tienda/${c.id}/`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...productos().map((p) => ({ url: `${base}/producto/${p.slug}/`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
