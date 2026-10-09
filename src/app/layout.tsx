import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { AnimacionVuelo } from "@/components/AnimacionVuelo";
import { Buscador } from "@/components/Buscador";
import { CarritoPanel } from "@/components/CarritoPanel";
import { Encabezado } from "@/components/Encabezado";
import { PixelMeta } from "@/components/PixelMeta";
import { Pie } from "@/components/Pie";
import { Proveedores } from "@/components/Proveedores";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";
import { TIENDA } from "@/config/tienda";
import { resumenCategorias } from "@/lib/catalogo";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const imagenCompartir = `${TIENDA.url}/marca/compartir.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(TIENDA.url.endsWith("/") ? TIENDA.url : `${TIENDA.url}/`),
  title: {
    default: `${TIENDA.nombre} · Joyería en oro laminado 18K`,
    template: `%s · ${TIENDA.nombre}`,
  },
  description: TIENDA.descripcion,
  keywords: [
    "oro laminado 18k",
    "joyería Bogotá",
    "topos oro laminado",
    "cadenas oro laminado",
    "pulseras oro laminado",
    "pulseras en balines",
    "manillas tejidas en balines",
    "candongas",
    "dijes religiosos",
    "N&V Joyería",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: TIENDA.nombre,
    title: `${TIENDA.nombre} · Joyas que brillan contigo`,
    description: TIENDA.descripcion,
    images: [{ url: imagenCompartir, width: 1200, height: 630, alt: TIENDA.nombre }],
  },
  twitter: { card: "summary_large_image", images: [imagenCompartir] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0a08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const categorias = resumenCategorias().map(({ id, nombre, lema, total, desde, portada, nueva }) => ({
    id,
    nombre,
    lema,
    total,
    desde,
    portada,
    ...(nueva ? { nueva } : {}),
  }));
  return (
    <html lang="es-CO" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <Proveedores>
          <PixelMeta />
          <Encabezado categorias={categorias} />
          <main className="min-h-[60vh]">{children}</main>
          <Pie />
          <CarritoPanel />
          <Buscador />
          <AnimacionVuelo />
          <WhatsAppFlotante />
        </Proveedores>
        {TIENDA.pixelMeta && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${TIENDA.pixelMeta}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
      </body>
    </html>
  );
}
