import type { NextConfig } from "next";

// Sitio 100 % estático (carpeta out/): se publica igual en GitHub Pages, Vercel, Netlify o cualquier hosting.
// En GitHub Pages el sitio vive en una subcarpeta (/Tienda-N-V-Joyer-a-), por eso basePath es configurable.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(basePath ? { basePath } : {}),
  images: { unoptimized: true },
  experimental: {
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
