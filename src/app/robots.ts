import type { MetadataRoute } from "next";
import { TIENDA } from "@/config/tienda";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/pedido/"] },
    sitemap: `${TIENDA.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
