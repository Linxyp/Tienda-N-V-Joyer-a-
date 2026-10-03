"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Award, Gem, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ProductoResumen } from "@/lib/tipos";
import { asset, cn, precio } from "@/lib/utilidades";
import { CuandoCerca } from "../CuandoCerca";
import { Revelar } from "../Revelar";

const EscenaGema = dynamic(() => import("../tres/EscenaGema"), { ssr: false });

export function Premium({ productos, total }: { productos: ProductoResumen[]; total: number }) {
  const [escenaLista, setEscenaLista] = useState(false);
  return (
    <section className="grano relative isolate overflow-hidden bg-noche py-20 text-marfil sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_75%_40%,rgba(201,155,60,.22),transparent_70%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-2 lg:px-8">
        <div className="relative order-2 lg:order-1">
          <Revelar>
            <p className="ceja flex items-center gap-3 text-oro-300">
              <span className="h-px w-8 bg-current opacity-60" /> Línea Premium
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[1.02] font-medium sm:text-6xl">
              Tejidos italianos con <em className="texto-oro">brillo de alta joyería</em>
            </h2>
            <p className="mt-5 max-w-lg text-niebla sm:text-lg">
              {total} piezas seleccionadas por su acabado superior: cadenas y pulseras de tejido italiano, topos con circones y
              detalles con base en plata 925.
            </p>
            <ul className="mt-8 grid max-w-lg gap-4 sm:grid-cols-3">
              {[
                { i: Gem, t: "Acabado espejo" },
                { i: Award, t: "Tejido italiano" },
                { i: Sparkles, t: "Brillo duradero" },
              ].map(({ i: I, t }) => (
                <li key={t} className="flex items-center gap-3 text-sm text-marfil/90">
                  <span className="grid size-10 place-items-center rounded-full border border-oro-400/40 text-oro-300">
                    <I className="size-4" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Revelar>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {productos.slice(0, 3).map((p, i) => (
              <Revelar key={p.id} retraso={i * 0.1}>
                <Link href={`/producto/${p.slug}/`} prefetch={false} className="group block">
                  <div className="borde-oro overflow-hidden rounded-2xl bg-carbon">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset(p.mini)}
                      alt={p.nombre}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs text-niebla group-hover:text-oro-200">{p.nombre}</p>
                  <p className="text-sm font-bold text-oro-300">{precio(p.precio)}</p>
                </Link>
              </Revelar>
            ))}
          </div>
          <Revelar className="mt-10">
            <Link href="/tienda/?premium=1" className="btn-oro">
              Ver Línea Premium <ArrowRight className="size-4" />
            </Link>
          </Revelar>
        </div>

        <div className="relative order-1 h-[380px] sm:h-[480px] lg:order-2 lg:h-[620px]">
          {/* Imagen del diamante mientras llega la escena 3D, que arranca sola al acercarse a la sección */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("marca/gema-3d-900.webp")}
            srcSet={`${asset("marca/gema-3d-600.webp")} 600w, ${asset("marca/gema-3d-900.webp")} 900w`}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Diamante girando entre aros de oro"
            loading="lazy"
            decoding="async"
            className={cn("absolute inset-0 size-full object-contain transition-opacity duration-1000", escenaLista && "opacity-0")}
          />
          <CuandoCerca className="absolute inset-0" margen="300px">
            <EscenaGema
              alListo={() => setEscenaLista(true)}
              className={cn("absolute inset-0 transition-opacity duration-1000", escenaLista ? "opacity-100" : "opacity-0")}
            />
          </CuandoCerca>
        </div>
      </div>
    </section>
  );
}
