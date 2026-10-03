"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Foto } from "@/lib/tipos";
import { asset, cn } from "@/lib/utilidades";
import { Inclinacion3D } from "../Inclinacion3D";

export function Galeria({ fotos, nombre, insignias }: { fotos: Foto[]; nombre: string; insignias?: React.ReactNode }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lupa, setLupa] = useState(false);
  const carril = useRef<HTMLDivElement>(null);
  const n = fotos.length;

  // Sincroniza el carrusel táctil con la miniatura activa
  useEffect(() => {
    const el = carril.current;
    if (!el) return;
    const f = () => setI(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", f, { passive: true });
    return () => el.removeEventListener("scroll", f);
  }, []);

  function irA(k: number) {
    const destino = (k + n) % n;
    setI(destino);
    carril.current?.scrollTo({ left: destino * carril.current.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    if (!lupa) return;
    const t = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLupa(false);
      if (e.key === "ArrowRight") setI((x) => (x + 1) % n);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n);
    };
    window.addEventListener("keydown", t);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", t);
      document.documentElement.style.overflow = "";
    };
  }, [lupa, n]);

  return (
    <div className="lg:sticky lg:top-24">
      <Inclinacion3D className="rounded-[28px]" grados={5} reflejo={false}>
        <div data-foto-principal className="relative overflow-hidden rounded-[28px] bg-perla shadow-[0_40px_80px_-40px_rgba(80,55,15,.6)] ring-1 ring-arena">
          {/* Celular: carrusel deslizable */}
          <div ref={carril} className="ocultar-scroll flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto lg:hidden">
            {fotos.map((f, k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={f.src}
                src={asset(f.src)}
                alt={k === 0 ? nombre : `${nombre} — foto ${k + 1}`}
                className="size-full shrink-0 snap-center object-cover"
                loading={k === 0 ? "eager" : "lazy"}
                fetchPriority={k === 0 ? "high" : "auto"}
                decoding="async"
                onClick={() => setLupa(true)}
              />
            ))}
          </div>

          {/* Escritorio: foto con lupa al pasar el mouse */}
          <div
            className="relative hidden aspect-[4/5] cursor-zoom-in lg:block"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom(null)}
            onClick={() => setLupa(true)}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={fotos[i].src}
                src={asset(fotos[i].src)}
                alt={nombre}
                fetchPriority={i === 0 ? "high" : "auto"}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 size-full object-cover"
              />
            </AnimatePresence>
            {zoom && (
              <div
                className="pointer-events-none absolute inset-0 bg-no-repeat"
                style={{
                  backgroundImage: `url(${asset(fotos[i].src)})`,
                  backgroundSize: "220%",
                  backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                }}
              />
            )}
          </div>

          <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">{insignias}</div>
          <button
            type="button"
            onClick={() => setLupa(true)}
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/85 text-tinta shadow backdrop-blur hover:bg-white"
            aria-label="Ver en pantalla completa"
          >
            <Expand className="size-4" />
          </button>
          {n > 1 && (
            <>
              <button
                type="button"
                onClick={() => irA(i - 1)}
                className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow backdrop-blur hover:bg-white lg:grid"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => irA(i + 1)}
                className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow backdrop-blur hover:bg-white lg:grid"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden">
                {fotos.map((f, k) => (
                  <span key={f.src} className={cn("h-1.5 rounded-full transition-all", k === i ? "w-6 bg-oro-500" : "w-1.5 bg-white/80")} />
                ))}
              </div>
            </>
          )}
        </div>
      </Inclinacion3D>

      {n > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {fotos.map((f, k) => (
            <button
              key={f.src}
              type="button"
              onClick={() => irA(k)}
              className={cn(
                "shrink-0 overflow-hidden rounded-2xl ring-2 transition-all duration-300",
                k === i ? "ring-oro-500" : "opacity-70 ring-transparent hover:opacity-100",
              )}
              aria-label={`Ver foto ${k + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(f.mini ?? f.src)} alt="" className="h-24 w-20 object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lupa && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-center justify-center bg-onix/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLupa(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Fotos de ${nombre}`}
          >
            <motion.img
              key={fotos[i].src}
              src={asset(fotos[i].src)}
              alt={nombre}
              initial={{ scale: 0.92, opacity: 0, rotateY: 12 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.4 }}
              style={{ transformPerspective: 1200 }}
              className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button type="button" className="absolute right-5 top-5 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Cerrar">
              <X className="size-6" />
            </button>
            {n > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setI((i - 1 + n) % n);
                  }}
                  className="absolute left-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setI((i + 1) % n);
                  }}
                  className="absolute right-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
