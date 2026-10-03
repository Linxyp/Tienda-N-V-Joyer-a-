import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Droplets, Gem } from "lucide-react";
import { Compra } from "@/components/producto/Compra";
import { Galeria } from "@/components/producto/Galeria";
import { Revelar } from "@/components/Revelar";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { categoriaPorId, nombreSub } from "@/config/categorias";
import { TIENDA } from "@/config/tienda";
import { productoPorSlug, productos, relacionados, resumen } from "@/lib/catalogo";
import { CUIDADOS } from "@/lib/descripciones";
import { precio } from "@/lib/utilidades";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return productos().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = productoPorSlug(slug);
  if (!p) return {};
  const imagen = `${TIENDA.url}/${p.fotos[0].src}`;
  return {
    title: `${p.nombre} · ${precio(p.precio)}`,
    description: p.descripcion,
    alternates: { canonical: `producto/${p.slug}/` },
    openGraph: {
      title: `${p.nombre} · ${precio(p.precio)}`,
      description: p.descripcion,
      images: [{ url: imagen, alt: p.nombre }],
    },
    twitter: { card: "summary_large_image", images: [imagen] },
  };
}

export default async function PaginaProducto({ params }: Props) {
  const { slug } = await params;
  const p = productoPorSlug(slug);
  if (!p) notFound();
  const cat = categoriaPorId(p.categoria)!;
  const sub = nombreSub(p.categoria, p.sub);
  const parecidos = relacionados(p).map(resumen);

  const datosEstructurados = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nombre,
    sku: p.sku,
    image: p.fotos.map((f) => `${TIENDA.url}/${f.src}`),
    description: p.descripcion,
    brand: { "@type": "Brand", name: TIENDA.nombre },
    material: "Oro laminado 18K",
    offers: {
      "@type": "Offer",
      priceCurrency: "COP",
      price: p.precio,
      availability: "https://schema.org/InStock",
      url: `${TIENDA.url}/producto/${p.slug}/`,
    },
  };

  return (
    <div className="bg-marfil">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-6 lg:px-8 lg:pt-10">
        <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-piedra">
          <Link href="/" className="hover:text-oro-700">
            Inicio
          </Link>
          <ChevronRight className="size-3 text-oro-500" />
          <Link href="/tienda/" className="hover:text-oro-700">
            Tienda
          </Link>
          <ChevronRight className="size-3 text-oro-500" />
          <Link href={`/tienda/${cat.id}/`} className="hover:text-oro-700">
            {cat.nombre}
          </Link>
          <ChevronRight className="size-3 text-oro-500" />
          <span className="line-clamp-1 text-tinta">{p.nombre}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Galeria
            fotos={p.fotos}
            nombre={p.nombre}
            insignias={
              <>
                {p.nuevo && (
                  <span className="rounded-full bg-onix/85 px-3 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-oro-200 uppercase backdrop-blur">
                    Nuevo
                  </span>
                )}
                {p.premium && (
                  <span className="fondo-oro rounded-full px-3 py-1 text-[0.62rem] font-bold tracking-[0.16em] text-onix uppercase shadow">
                    Línea Premium
                  </span>
                )}
              </>
            }
          />

          <div>
            <p className="ceja text-oro-700">
              {cat.nombre}
              {sub ? ` · ${sub}` : ""}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] font-medium text-tinta sm:text-5xl">{p.nombre}</h1>
            <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-display text-4xl font-semibold text-oro-700">{precio(p.precio)}</span>
              <span className="text-xs tracking-[0.14em] text-piedra uppercase">Ref. {p.sku}</span>
            </div>
            <p className="mt-6 leading-relaxed text-piedra">{p.descripcion}</p>

            <div className="my-8 h-px bg-gradient-to-r from-oro-400/60 via-arena to-transparent" />

            <Compra
              p={{
                id: p.id,
                slug: p.slug,
                sku: p.sku,
                nombre: p.nombre,
                precio: p.precio,
                foto: p.fotos[0].mini ?? p.fotos[0].src,
                colores: p.colores,
                tallas: p.tallas,
                letra: p.letra,
              }}
            />

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-display text-2xl text-tinta">
                  <Gem className="size-5 text-oro-600" /> Detalles
                </h2>
                <ul className="space-y-2.5">
                  {p.caracteristicas.map((c) => (
                    <li key={c} className="flex gap-2.5 text-sm text-piedra">
                      <Check className="mt-0.5 size-4 shrink-0 text-oro-600" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="mb-4 flex items-center gap-2 font-display text-2xl text-tinta">
                  <Droplets className="size-5 text-oro-600" /> Cuidados
                </h2>
                <p className="text-sm leading-relaxed text-piedra">{CUIDADOS}</p>
              </div>
            </div>
          </div>
        </div>

        {parecidos.length > 0 && (
          <section className="mt-24">
            <Revelar className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="ceja text-oro-700">También te puede gustar</p>
                <h2 className="mt-3 font-display text-4xl text-tinta sm:text-5xl">Más {cat.nombre.toLowerCase()}</h2>
              </div>
              <Link href={`/tienda/${cat.id}/`} className="hidden text-sm font-bold text-oro-700 hover:underline sm:block">
                Ver todo →
              </Link>
            </Revelar>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {parecidos.map((r, i) => (
                <Revelar key={r.id} retraso={(i % 4) * 0.07}>
                  <TarjetaProducto p={r} />
                </Revelar>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
