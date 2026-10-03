"use client";

import Link from "next/link";
import { useRef } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { nombreSub, categoriaPorId } from "@/config/categorias";
import type { ProductoResumen } from "@/lib/tipos";
import { asset, cn, precio } from "@/lib/utilidades";
import { Inclinacion3D } from "./Inclinacion3D";
import { useAgregar } from "./useAgregar";

export function TarjetaProducto({
  p,
  prioridad = false,
  oscuro = false,
}: {
  p: ProductoResumen;
  prioridad?: boolean;
  oscuro?: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const agregar = useAgregar();
  const href = `/producto/${p.slug}/`;
  const etiqueta = nombreSub(p.categoria, p.sub) ?? categoriaPorId(p.categoria)?.nombre;

  return (
    <Inclinacion3D className="group h-full rounded-[22px]" grados={8}>
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[22px] transition-shadow duration-500",
          oscuro
            ? "borde-oro bg-carbon/80 shadow-[0_20px_50px_-30px_rgba(0,0,0,.9)] hover:shadow-[0_30px_70px_-30px_rgba(201,155,60,.45)]"
            : "bg-white shadow-[0_18px_40px_-28px_rgba(60,40,10,.45)] ring-1 ring-arena/70 hover:shadow-[0_34px_70px_-30px_rgba(150,105,30,.55)]",
        )}
      >
        <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-perla" style={{ transform: "translateZ(30px)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={asset(p.mini)}
            alt={p.nombre}
            width={640}
            height={800}
            loading={prioridad ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "absolute inset-0 size-full object-cover transition-all duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]",
              p.mini2 && "group-hover:opacity-0",
            )}
          />
          {p.mini2 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset(p.mini2)}
              alt=""
              aria-hidden
              width={640}
              height={800}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full scale-[1.07] object-cover opacity-0 transition-all duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-100 group-hover:opacity-100"
            />
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {p.nuevo && (
              <span className="rounded-full bg-onix/85 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.2em] text-oro-200 uppercase backdrop-blur">
                Nuevo
              </span>
            )}
            {p.premium && (
              <span className="fondo-oro rounded-full px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.16em] text-onix uppercase shadow">
                Línea Premium
              </span>
            )}
          </div>
        </Link>

        {p.opciones ? (
          <Link
            href={href}
            aria-label={`Elegir opciones de ${p.nombre}`}
            className="absolute right-3 top-3 z-30 grid size-10 place-items-center rounded-full bg-white/90 text-tinta shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-oro-300 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            style={{ transform: "translateZ(60px)" }}
          >
            <SlidersHorizontal className="size-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() =>
              agregar(
                { id: p.id, slug: p.slug, sku: p.sku, nombre: p.nombre, precio: p.precio, foto: p.mini },
                { origen: imgRef.current },
              )
            }
            aria-label={`Agregar ${p.nombre} al pedido`}
            className="absolute right-3 top-3 z-30 grid size-10 place-items-center rounded-full bg-white/90 text-tinta shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-oro-300 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            style={{ transform: "translateZ(60px)" }}
          >
            <Plus className="size-5" />
          </button>
        )}

        <Link href={href} className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3.5" style={{ transform: "translateZ(20px)" }}>
          <span className={cn("text-[0.62rem] font-bold tracking-[0.22em] uppercase", oscuro ? "text-oro-400" : "text-oro-700")}>
            {etiqueta}
          </span>
          <h3
            className={cn(
              "line-clamp-2 font-display text-[1.12rem] leading-tight font-semibold sm:text-[1.2rem]",
              oscuro ? "text-marfil" : "text-tinta",
            )}
          >
            {p.nombre}
          </h3>
          <span className="mt-auto flex items-end justify-between gap-2 pt-1">
            <span className={cn("text-[1.02rem] font-bold tracking-wide", oscuro ? "text-oro-300" : "text-oro-700")}>
              {precio(p.precio)}
            </span>
            <span
              className={cn(
                "text-[0.62rem] font-semibold tracking-[0.18em] uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                oscuro ? "text-niebla" : "text-piedra",
              )}
            >
              {p.opciones ? "Elegir" : "Ver"} →
            </span>
          </span>
        </Link>
      </article>
    </Inclinacion3D>
  );
}
