"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { METODOS_PAGO } from "@/config/tienda";
import { textoOpciones } from "@/lib/whatsapp";
import { asset, plural, precio } from "@/lib/utilidades";
import { totalCarrito, unidadesCarrito, useCarrito } from "@/store/carrito";

export function CarritoPanel() {
  const { items, abierto, cerrar, cambiarCantidad, quitar } = useCarrito();
  const router = useRouter();
  const total = totalCarrito(items);
  const unidades = unidadesCarrito(items);

  useEffect(() => {
    if (!abierto) return;
    toast.dismiss(); // el aviso de "Agregado" ya no hace falta con el pedido abierto
    const esc = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", esc);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.documentElement.style.overflow = "";
    };
  }, [abierto, cerrar]);

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Tu pedido">
          <motion.button
            type="button"
            aria-label="Cerrar"
            onClick={cerrar}
            className="absolute inset-0 bg-onix/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={{ x: "100%", rotateY: -18 }}
            animate={{ x: 0, rotateY: 0 }}
            exit={{ x: "100%", rotateY: -12 }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            style={{ transformPerspective: 1400, transformOrigin: "right center" }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-marfil shadow-[-30px_0_80px_-20px_rgba(0,0,0,.55)]"
          >
            <header className="flex items-center justify-between border-b border-arena px-6 py-5">
              <div>
                <p className="ceja text-oro-700">Tu pedido</p>
                <p className="mt-1 font-display text-2xl text-tinta">
                  {unidades ? plural(unidades, "joya elegida", "joyas elegidas") : "Aún no hay joyas"}
                </p>
              </div>
              <button
                type="button"
                onClick={cerrar}
                className="grid size-10 place-items-center rounded-full border border-arena text-tinta transition-colors hover:bg-perla"
                aria-label="Cerrar pedido"
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <div className="grid size-24 place-items-center rounded-full bg-perla">
                  <ShoppingBag className="size-10 text-oro-500" strokeWidth={1.2} />
                </div>
                <p className="font-display text-2xl text-tinta">Tu joyero está esperando</p>
                <p className="text-sm text-piedra">Explora la colección y agrega tus favoritas. Luego envías el pedido por WhatsApp.</p>
                <Link href="/tienda/" onClick={cerrar} className="btn-oro">
                  Ver colección <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto px-4 py-4" data-lenis-prevent>
                  <AnimatePresence initial={false}>
                    {items.map((i) => {
                      const op = textoOpciones(i.opciones);
                      return (
                        <motion.li
                          key={i.clave}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 60, height: 0, marginTop: 0 }}
                          className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-arena/70"
                        >
                          <Link href={`/producto/${i.slug}/`} onClick={cerrar} className="shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={asset(i.foto)} alt={i.nombre} className="h-24 w-20 rounded-xl object-cover" />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/producto/${i.slug}/`}
                                onClick={cerrar}
                                className="line-clamp-2 font-display text-[1.05rem] leading-tight font-semibold text-tinta hover:text-oro-700"
                              >
                                {i.nombre}
                              </Link>
                              <button
                                type="button"
                                onClick={() => quitar(i.clave)}
                                className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full text-piedra transition-colors hover:bg-red-50 hover:text-red-700"
                                aria-label={`Quitar ${i.nombre}`}
                              >
                                <Trash className="size-4" />
                              </button>
                            </div>
                            {op && <p className="mt-0.5 text-xs text-piedra">{op}</p>}
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center rounded-full ring-1 ring-arena">
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidad(i.clave, i.cantidad - 1)}
                                  disabled={i.cantidad <= 1}
                                  className="grid size-8 place-items-center rounded-full text-tinta disabled:opacity-30"
                                  aria-label="Una menos"
                                >
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="w-7 text-center text-sm font-bold tabular-nums">{i.cantidad}</span>
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidad(i.clave, i.cantidad + 1)}
                                  className="grid size-8 place-items-center rounded-full text-tinta"
                                  aria-label="Una más"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                              <span className="font-bold text-oro-700">{precio(i.precio * i.cantidad)}</span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>

                <footer className="space-y-4 border-t border-arena bg-perla/60 px-6 pb-6 pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-piedra">Total productos</span>
                    <span className="font-display text-3xl font-semibold text-tinta">{precio(total)}</span>
                  </div>
                  <p className="text-xs text-piedra">El envío se confirma por WhatsApp según tu ciudad.</p>
                  <button
                    type="button"
                    onClick={() => {
                      cerrar();
                      router.push("/pedido/");
                    }}
                    className="btn-oro w-full"
                  >
                    Finalizar pedido <ArrowRight className="size-4" />
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[0.68rem] font-semibold tracking-[0.12em] text-piedra uppercase">
                    Pagas con
                    {METODOS_PAGO.map((m) => (
                      <span
                        key={m.id}
                        className="rounded-full px-2 py-0.5 text-[0.62rem] tracking-normal normal-case"
                        style={{ background: m.color, color: m.colorTexto }}
                      >
                        {m.nombre}
                      </span>
                    ))}
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
