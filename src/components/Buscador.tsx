"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CornerDownRight, LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIAS, categoriaPorId } from "@/config/categorias";
import { buscar, cargarCatalogo } from "@/lib/busqueda";
import type { ProductoResumen } from "@/lib/tipos";
import { asset, cn, precio } from "@/lib/utilidades";
import { useUI } from "@/store/ui";

const SUGERENCIAS = ["Cadena cubana", "Topos corazón", "Pulsera clover", "San Benito", "Guadalupe", "Anillo ajustable", "Tejido chino", "Letra"];

export function Buscador() {
  const abierto = useUI((s) => s.buscador);
  const abrir = useUI((s) => s.abrirBuscador);
  const cerrar = useUI((s) => s.cerrarBuscador);
  const router = useRouter();
  const [catalogo, setCatalogo] = useState<ProductoResumen[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [activo, setActivo] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  // Atajos: Ctrl/Cmd + K o "/"
  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      const escribiendo = (e.target as HTMLElement)?.closest("input, textarea, select");
      if ((e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !escribiendo)) {
        e.preventDefault();
        abrir();
      }
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abrir]);

  useEffect(() => {
    if (!abierto) return;
    cargarCatalogo()
      .then((lista) => {
        setCatalogo(lista);
        setError(false);
      })
      .catch(() => setError(true));
    const t = setTimeout(() => input.current?.focus(), 60);
    document.documentElement.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [abierto]);

  const resultados = useMemo(() => (catalogo && q.trim() ? buscar(catalogo, q) : []), [catalogo, q]);
  const visibles = resultados.slice(0, 8);

  function ir(href: string) {
    cerrar();
    setQ("");
    router.push(href);
  }

  function teclas(e: React.KeyboardEvent) {
    if (e.key === "Escape") cerrar();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((a) => Math.min(a + 1, visibles.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (visibles[activo]) ir(`/producto/${visibles[activo].slug}/`);
      else if (q.trim()) ir(`/tienda/?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]" role="dialog" aria-modal="true" aria-label="Buscar joyas">
          <motion.button
            type="button"
            aria-label="Cerrar búsqueda"
            className="absolute inset-0 bg-onix/70 backdrop-blur-md"
            onClick={cerrar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, rotateX: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 1200 }}
            className="borde-oro relative w-full max-w-2xl overflow-hidden rounded-3xl bg-noche text-marfil shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5">
              <Search className="size-5 shrink-0 text-oro-300" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActivo(0);
                }}
                onKeyDown={teclas}
                placeholder="Busca topos, cadenas, San Benito, clover…"
                className="h-16 w-full bg-transparent text-lg text-marfil placeholder:text-niebla/60 focus:outline-none"
                aria-label="Buscar"
                enterKeyHint="search"
              />
              {!catalogo && !error && <LoaderCircle className="size-5 shrink-0 animate-spin text-oro-300" />}
              <button type="button" onClick={cerrar} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/10" aria-label="Cerrar">
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-3" data-lenis-prevent>
              {error && <p className="p-4 text-sm text-red-300">No pudimos cargar el catálogo. Revisa tu conexión e inténtalo de nuevo.</p>}

              {!q.trim() && (
                <div className="space-y-5 p-3">
                  <div>
                    <p className="ceja mb-3 text-oro-400">Búsquedas populares</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGERENCIAS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setQ(s);
                            setActivo(0);
                          }}
                          className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-niebla transition-colors hover:border-oro-400/60 hover:text-oro-100"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="ceja mb-3 text-oro-400">Categorías</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CATEGORIAS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => ir(`/tienda/${c.id}/`)}
                          className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-oro-400/15"
                        >
                          {c.nombre} <ArrowRight className="size-3.5 text-oro-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {q.trim() && catalogo && (
                <>
                  {visibles.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="font-display text-2xl">Sin resultados para “{q}”</p>
                      <p className="mt-2 text-sm text-niebla">Prueba con otra palabra o escríbenos por WhatsApp: te ayudamos a encontrarla.</p>
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {visibles.map((p, i) => (
                        <li key={p.id}>
                          <Link
                            href={`/producto/${p.slug}/`}
                            onClick={() => {
                              cerrar();
                              setQ("");
                            }}
                            onMouseEnter={() => setActivo(i)}
                            className={cn(
                              "flex items-center gap-4 rounded-2xl p-2.5 transition-colors",
                              i === activo ? "bg-oro-400/15" : "hover:bg-white/5",
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={asset(p.mini)} alt="" className="h-16 w-13 shrink-0 rounded-xl object-cover" loading="lazy" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-lg">{p.nombre}</span>
                              <span className="text-xs text-niebla">{categoriaPorId(p.categoria)?.nombre}</span>
                            </span>
                            <span className="shrink-0 text-sm font-bold text-oro-300">{precio(p.precio)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {resultados.length > visibles.length && (
                    <button
                      type="button"
                      onClick={() => ir(`/tienda/?q=${encodeURIComponent(q.trim())}`)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-oro-400/30 py-3 text-sm font-semibold text-oro-200 transition-colors hover:bg-oro-400/10"
                    >
                      <CornerDownRight className="size-4" /> Ver los {resultados.length} resultados
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
