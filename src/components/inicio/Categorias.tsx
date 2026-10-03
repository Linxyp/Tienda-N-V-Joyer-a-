import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ResumenCategoria } from "@/lib/catalogo";
import { asset, cn, precio, srcSetMini } from "@/lib/utilidades";
import { Inclinacion3D } from "../Inclinacion3D";
import { Revelar } from "../Revelar";
import { TituloSeccion } from "../TituloSeccion";

export function Categorias({ categorias }: { categorias: ResumenCategoria[] }) {
  return (
    <section id="categorias" className="relative bg-marfil py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <TituloSeccion
          ceja="Colecciones"
          titulo={
            <>
              Encuentra la joya <em className="texto-oro">perfecta</em>
            </>
          }
          texto="Explora por categoría: cada pieza en oro laminado 18K, lista para lucir o para regalar."
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {categorias.map((c, i) => (
            <Revelar key={c.id} retraso={(i % 4) * 0.08} className={cn(i === 0 && "col-span-2 row-span-2 lg:col-span-2")}>
              <Inclinacion3D className="h-full rounded-[26px]" grados={7}>
                <Link
                  href={`/tienda/${c.id}/`}
                  className={cn(
                    "group relative block h-full overflow-hidden rounded-[26px] bg-onix shadow-[0_24px_60px_-34px_rgba(60,40,10,.8)]",
                    i === 0 ? "aspect-square lg:aspect-auto lg:min-h-full" : "aspect-[4/5]",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(c.portada)}
                    srcSet={srcSetMini(c.portada)}
                    sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                    alt={c.nombre}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover opacity-90 transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-onix via-onix/35 to-transparent" />
                  <span className="absolute inset-0 rounded-[26px] ring-1 ring-inset ring-oro-300/0 transition-all duration-500 group-hover:ring-oro-300/60" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6" style={{ transform: "translateZ(40px)" }}>
                    <span>
                      <span className="block text-[0.62rem] font-bold tracking-[0.24em] text-oro-300 uppercase">
                        {c.total} diseños
                      </span>
                      <span className={cn("mt-1 block font-display leading-none text-marfil", i === 0 ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl")}>
                        {c.nombre}
                      </span>
                      <span className="mt-2 hidden text-sm text-niebla sm:block">{c.lema}</span>
                      <span className="mt-1.5 block text-xs text-oro-100/80">Desde {precio(c.desde)}</span>
                    </span>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-oro-300/50 text-oro-200 transition-all duration-500 group-hover:rotate-45 group-hover:bg-oro-300 group-hover:text-onix">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </span>
                </Link>
              </Inclinacion3D>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}
