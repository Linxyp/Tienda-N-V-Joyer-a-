"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { TIENDA } from "@/config/tienda";
import { asset, cn } from "@/lib/utilidades";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { IconoWhatsApp } from "../IconoWhatsApp";

const EscenaJoya = dynamic(() => import("../tres/EscenaJoya"), { ssr: false });

/**
 * Arranca la escena 3D sola, apenas la página terminó de cargar y el navegador queda libre
 * (así no compite con el texto y las fotos que se ven primero). Aplica en celular y computador.
 */
function useMontarTarde() {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    const iniciar = () => setListo(true);
    const enReposo = () => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(iniciar, { timeout: 900 });
      else setTimeout(iniciar, 150);
    };
    if (document.readyState === "complete") enReposo();
    else window.addEventListener("load", enReposo, { once: true });
    return () => window.removeEventListener("load", enReposo);
  }, []);
  return listo;
}

export function Hero({ totalProductos }: { totalProductos: number }) {
  const redondeado = Math.floor(totalProductos / 50) * 50;
  const montar3D = useMontarTarde();
  const [escenaLista, setEscenaLista] = useState(false);
  return (
    <section className="grano relative isolate overflow-hidden bg-onix text-marfil">
      {/* resplandores de fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 top-10 size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(201,155,60,.28),transparent_62%)] blur-2xl" />
        <div className="absolute -left-40 bottom-0 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(201,155,60,.14),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_70%,#0b0a08)]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100svh-6.5rem)] max-w-7xl grid-cols-1 items-center px-5 pb-16 pt-6 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pt-0">
        {/* Escena 3D (arriba en celular, a la derecha en escritorio) */}
        <div className="relative order-1 -mx-5 h-[50svh] min-h-[340px] lg:order-2 lg:mx-0 lg:h-[min(78svh,760px)]">
          {/* Imagen renderizada de la misma escena: se ve al instante y luego se funde con el 3D en vivo */}
          <picture>
            <source media="(min-width: 1024px)" srcSet={`${asset("marca/joya-3d-900.webp")} 900w`} sizes="50vw" />
            <img
              src={asset("marca/joya-3d-movil-900.webp")}
              srcSet={`${asset("marca/joya-3d-movil-600.webp")} 600w, ${asset("marca/joya-3d-movil-900.webp")} 900w`}
              sizes="100vw"
              alt="Anillo de oro con diamante y cadena girando a su alrededor"
              fetchPriority="high"
              decoding="async"
              className={cn(
                "absolute inset-0 size-full object-contain transition-opacity duration-1000 lg:-inset-x-16 lg:w-[calc(100%+8rem)]",
                escenaLista && "opacity-0",
              )}
            />
          </picture>
          {montar3D && (
            <EscenaJoya
              alListo={() => setEscenaLista(true)}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 lg:-inset-x-16",
                escenaLista ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-onix to-transparent lg:hidden" />
        </div>

        <div className="order-2 lg:order-1">
          <p className="entrada ceja flex items-center gap-3 text-oro-300" style={{ animationDelay: "0.15s" }}>
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-oro-400" />
            Oro laminado 18K
          </p>
          <h1
            className="entrada-titulo mt-5 font-display text-[3.1rem] leading-[0.95] font-medium tracking-tight sm:text-7xl lg:text-[5.6rem]"
            style={{ animationDelay: "0.25s" }}
          >
            Joyas que <br className="hidden sm:block" />
            <em className="texto-oro font-semibold not-italic sm:italic">brillan contigo</em>
          </h1>
          <p className="entrada mt-6 max-w-xl text-[1.02rem] leading-relaxed text-niebla sm:text-lg" style={{ animationDelay: "0.35s" }}>
            Topos, candongas, cadenas, pulseras, anillos y dijes en oro laminado 18K. Elige tus favoritas, envíanos tu
            pedido por WhatsApp y paga fácil con <span className="text-oro-200">Nequi, Daviplata o Llave Bre-B</span>.
          </p>

          <div className="entrada mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "0.45s" }}>
            <Link href="/tienda/" className="btn-oro">
              Ver colección <ArrowRight className="size-4" />
            </Link>
            <a
              href={enlaceWhatsApp(`Hola ${TIENDA.nombre}, quiero asesoría para elegir una joya.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-contorno"
            >
              <IconoWhatsApp className="size-4" /> Asesoría por WhatsApp
            </a>
          </div>

          <ul className="entrada mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-white/10 pt-7" style={{ animationDelay: "0.55s" }}>
            {[
              { icono: ShieldCheck, titulo: "Hasta 5 años", texto: "de garantía" },
              { icono: Truck, titulo: "Envíos", texto: "a toda Colombia" },
              { icono: Wallet, titulo: "Paga fácil", texto: "Nequi · Daviplata · Llave" },
            ].map(({ icono: Icono, titulo, texto }) => (
              <li key={titulo} className="flex flex-col gap-2">
                <Icono className="size-5 text-oro-300" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-marfil">{titulo}</span>
                <span className="text-xs leading-snug text-niebla">{texto}</span>
              </li>
            ))}
          </ul>
          <p className="entrada mt-6 text-xs tracking-[0.2em] text-niebla/80 uppercase" style={{ animationDelay: "0.65s" }}>
            Más de {redondeado} diseños · Envío desde {TIENDA.ciudad}
          </p>
        </div>
      </div>
    </section>
  );
}
