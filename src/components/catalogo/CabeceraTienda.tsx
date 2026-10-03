import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { asset, precio } from "@/lib/utilidades";

export function CabeceraTienda({
  titulo,
  lema,
  total,
  desde,
  fotos,
  migas,
}: {
  titulo: string;
  lema: string;
  total: number;
  desde: number;
  fotos: string[];
  migas: { href?: string; texto: string }[];
}) {
  return (
    <section className="grano relative isolate overflow-hidden bg-onix pb-14 pt-10 text-marfil sm:pb-20 sm:pt-14">
      <div className="pointer-events-none absolute -right-24 -top-24 -z-10 size-[34rem] rounded-full bg-[radial-gradient(circle,rgba(201,155,60,.22),transparent_65%)]" />
      <div className="mx-auto grid max-w-7xl items-end gap-8 px-5 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-xs text-niebla">
            {migas.map((m, i) => (
              <span key={m.texto} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3 text-oro-500" />}
                {m.href ? (
                  <Link href={m.href} className="hover:text-oro-200">
                    {m.texto}
                  </Link>
                ) : (
                  <span className="text-oro-200">{m.texto}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="mt-5 font-display text-5xl leading-none font-medium sm:text-7xl">
            <span className="texto-oro">{titulo}</span>
          </h1>
          <p className="mt-4 max-w-xl text-niebla sm:text-lg">{lema}</p>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold tracking-[0.2em] text-oro-200/90 uppercase">
            <span>{total.toLocaleString("es-CO")} diseños</span>
            <span>Desde {precio(desde)}</span>
            <span>Oro laminado 18K</span>
          </p>
        </div>
        <div className="hidden items-end gap-3 lg:flex" aria-hidden>
          {fotos.slice(0, 3).map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={f}
              src={asset(f)}
              alt=""
              loading="lazy"
              decoding="async"
              className="borde-oro w-32 rounded-2xl object-cover shadow-2xl ring-1 ring-oro-400/30"
              style={{
                aspectRatio: "4/5",
                transform: `perspective(800px) rotateY(${(i - 1) * -14}deg) translateY(${i === 1 ? -18 : 0}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
