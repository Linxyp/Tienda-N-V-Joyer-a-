"use client";

import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { METODOS_PAGO, TIENDA } from "@/config/tienda";
import type { OpcionesElegidas } from "@/lib/tipos";
import { asset, cn, precio } from "@/lib/utilidades";
import { datosProducto, evento } from "@/lib/pixel";
import { enlaceWhatsApp, mensajeProducto } from "@/lib/whatsapp";
import { MAX_CANTIDAD } from "@/store/carrito";
import { IconoWhatsApp } from "../IconoWhatsApp";
import { useAgregar } from "../useAgregar";

const MUESTRAS: Record<string, string> = {
  Cristal: "linear-gradient(135deg,#ffffff,#dfe6ee 45%,#ffffff 60%,#cfd8e3)",
  Verde: "radial-gradient(circle at 35% 30%,#7ee2a8,#0f7a41 70%)",
  Negro: "radial-gradient(circle at 35% 30%,#6b6b6b,#0a0a0a 70%)",
  Rojo: "radial-gradient(circle at 35% 30%,#ff8a8a,#b3121f 70%)",
  Rosa: "radial-gradient(circle at 35% 30%,#ffd1e1,#e86a9a 70%)",
  Azul: "radial-gradient(circle at 35% 30%,#9cc8ff,#1b4fbf 70%)",
  Fucsia: "radial-gradient(circle at 35% 30%,#ff9ad8,#c4127f 70%)",
  Naranja: "radial-gradient(circle at 35% 30%,#ffd09a,#e0661b 70%)",
  Morado: "radial-gradient(circle at 35% 30%,#d4b0ff,#5f2bb5 70%)",
  Multicolor: "conic-gradient(#ff5d5d,#ffc75d,#7ee27e,#5dc6ff,#b07bff,#ff5d5d)",
  Beige: "radial-gradient(circle at 35% 30%,#f3e3c8,#c4a77d 70%)",
  "Azul cielo": "radial-gradient(circle at 35% 30%,#d5ecff,#79b6e8 70%)",
  Lila: "radial-gradient(circle at 35% 30%,#efe0ff,#b28ddf 70%)",
  Gris: "radial-gradient(circle at 35% 30%,#e3e3e3,#8c8c8c 70%)",
  Turquesa: "radial-gradient(circle at 35% 30%,#b8fff4,#1fb5a3 70%)",
};

export interface DatosCompra {
  id: string;
  slug: string;
  sku: string;
  nombre: string;
  precio: number;
  foto: string;
  colores?: string[];
  /** Título del selector de color ("Color del circón" por defecto) */
  etiquetaColor?: string;
  tallas?: string[];
  /** true = una inicial; un número = cuántas iniciales (pulseras de pareja) */
  letra?: boolean | number;
  /** Texto de garantía si no aplica el general */
  garantia?: string;
}

export function Compra({ p }: { p: DatosCompra }) {
  const agregar = useAgregar();
  const [cantidad, setCantidad] = useState(1);
  const [color, setColor] = useState<string | undefined>(p.colores?.length === 1 ? p.colores[0] : undefined);
  const [talla, setTalla] = useState<string | undefined>(p.tallas?.length === 1 ? p.tallas[0] : undefined);
  const [letra, setLetra] = useState("");
  const nLetras = p.letra === true ? 1 : Number(p.letra || 0);
  const [faltan, setFaltan] = useState<string[]>([]);
  const sacudir = useAnimationControls();
  const botones = useRef<HTMLDivElement>(null);
  const [barra, setBarra] = useState(false);

  // Píxel de Meta: producto visto (sirve para remarketing y anuncios de catálogo)
  const { sku, nombre, precio: valor } = p;
  useEffect(() => {
    evento("ViewContent", datosProducto({ sku, nombre, precio: valor }));
  }, [sku, nombre, valor]);

  // Barra fija en celular cuando los botones principales salen de la pantalla
  useEffect(() => {
    const el = botones.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarra(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function validar(): OpcionesElegidas | null {
    const f: string[] = [];
    if (p.colores && p.colores.length > 1 && !color) f.push("color");
    if (p.tallas && p.tallas.length > 1 && !talla) f.push("talla");
    if (nLetras && !new RegExp(`^[A-ZÑ]{${nLetras}}$`, "i").test(letra.trim())) f.push("letra");
    setFaltan(f);
    if (f.length) {
      sacudir.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.45 } });
      botones.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return null;
    }
    return {
      ...(color ? { color } : {}),
      ...(talla ? { talla } : {}),
      ...(nLetras ? { letra: letra.trim().toUpperCase() } : {}),
    };
  }

  function alAgregar(origen: Element | null) {
    const opciones = validar();
    if (!opciones) return;
    agregar(
      { id: p.id, slug: p.slug, sku: p.sku, nombre: p.nombre, precio: p.precio, foto: p.foto },
      { opciones, cantidad, origen },
    );
  }

  function pedirYa() {
    const opciones = validar();
    if (!opciones) return;
    const texto = mensajeProducto({
      nombre: p.nombre,
      sku: p.sku,
      precio: p.precio,
      cantidad,
      opciones,
      url: `${TIENDA.url}/producto/${p.slug}/`,
    });
    // Pedido directo por WhatsApp = la conversión que optimiza la pauta
    evento("Lead", datosProducto(p, cantidad));
    window.open(enlaceWhatsApp(texto), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-7">
      <motion.div animate={sacudir} className="space-y-7 empty:hidden">
      {p.colores && p.colores.length > 0 && (
        <fieldset>
          <legend className="mb-3 flex items-baseline gap-2 text-sm font-bold text-tinta">
            {p.etiquetaColor ?? "Color del circón"}
            {color && <span className="font-normal text-piedra">· {color}</span>}
            {faltan.includes("color") && <span className="text-xs font-semibold text-orange-700">Elige un color</span>}
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {p.colores.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setFaltan((f) => f.filter((x) => x !== "color"));
                }}
                aria-pressed={color === c}
                className={cn(
                  "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold ring-1 transition-all",
                  color === c ? "bg-onix text-oro-100 ring-onix" : "bg-white text-tinta ring-arena hover:ring-oro-400",
                )}
              >
                <span className="size-7 rounded-full ring-1 ring-black/10" style={{ background: MUESTRAS[c] ?? "#ddd" }} />
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {p.tallas && p.tallas.length > 0 && (
        <fieldset>
          <legend className="mb-3 flex items-baseline gap-2 text-sm font-bold text-tinta">
            Talla disponible
            {faltan.includes("talla") && <span className="text-xs font-semibold text-orange-700">Elige tu talla</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {p.tallas.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTalla(t);
                  setFaltan((f) => f.filter((x) => x !== "talla"));
                }}
                aria-pressed={talla === t}
                className={cn(
                  "grid h-11 min-w-12 place-items-center rounded-xl px-3 text-sm font-bold ring-1 transition-all",
                  talla === t ? "bg-onix text-oro-100 ring-onix" : "bg-white text-tinta ring-arena hover:ring-oro-400",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-piedra">¿No sabes tu talla? Escríbenos y te ayudamos a medirla.</p>
        </fieldset>
      )}

      {nLetras > 0 && (
        <div>
          <label className="mb-3 flex items-baseline gap-2 text-sm font-bold text-tinta" htmlFor="letra">
            {nLetras === 1 ? "Inicial que quieres" : `Las ${nLetras} iniciales`}
            {faltan.includes("letra") && (
              <span className="text-xs font-semibold text-orange-700">
                {nLetras === 1 ? "Escribe una letra" : `Escribe ${nLetras} letras`}
              </span>
            )}
          </label>
          <input
            id="letra"
            value={letra}
            onChange={(e) => {
              const v = e.target.value.replace(/[^a-zñ]/gi, "").slice(0, nLetras).toUpperCase();
              setLetra(v);
              if (v.length === nLetras) setFaltan((f) => f.filter((x) => x !== "letra"));
            }}
            placeholder={"AB".slice(0, nLetras)}
            className={cn(
              "campo text-center font-display text-3xl uppercase",
              nLetras === 1 ? "!w-20" : "!w-28 tracking-[0.3em]",
            )}
            aria-invalid={faltan.includes("letra")}
            maxLength={nLetras}
          />
          <p className="mt-2 text-xs text-piedra">
            Confirmamos la disponibilidad {nLetras === 1 ? "de la letra" : "de las letras"} por WhatsApp.
          </p>
        </div>
      )}
      </motion.div>

      <div ref={botones} className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-14 items-center rounded-full bg-white ring-1 ring-arena">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              className="grid size-12 place-items-center rounded-full disabled:opacity-30"
              disabled={cantidad <= 1}
              aria-label="Menos"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-lg font-bold tabular-nums" aria-live="polite">
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.min(MAX_CANTIDAD, c + 1))}
              className="grid size-12 place-items-center rounded-full"
              aria-label="Más"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button type="button" onClick={() => alAgregar(document.querySelector("[data-foto-principal]"))} className="btn-oro h-14 flex-1">
            <ShoppingBag className="size-5 shrink-0" />
            <span className="sm:hidden">Agregar</span>
            <span className="hidden sm:inline">Agregar a mi pedido</span>
          </button>
        </div>
        <button type="button" onClick={pedirYa} className="btn-whatsapp h-14 w-full">
          <IconoWhatsApp className="size-5" /> Pedir ya por WhatsApp
        </button>
      </div>

      <div className="grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-arena sm:grid-cols-2">
        <div className="flex gap-3">
          <ShieldCheck className="size-5 shrink-0 text-oro-600" />
          <p className="text-sm text-piedra">
            <strong className="block text-tinta">Garantía</strong>
            {p.garantia ?? "Hasta 5 años por cambio de tonalidad."}
          </p>
        </div>
        <div className="flex gap-3">
          <Truck className="size-5 shrink-0 text-oro-600" />
          <p className="text-sm text-piedra">
            <strong className="block text-tinta">Envíos a toda Colombia</strong>
            Costo según tu ciudad, te lo confirmamos.
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-piedra uppercase">Paga fácil al {TIENDA.whatsappVisible}</p>
          <div className="flex flex-wrap gap-2">
            {METODOS_PAGO.map((m) => (
              <span key={m.id} className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ background: m.color, color: m.colorTexto }}>
                {m.nombre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Barra inferior en celular */}
      <AnimatePresence>
        {barra && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-arena bg-marfil/95 px-4 py-3 backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(p.foto)} alt="" className="size-12 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-tinta">{p.nombre}</p>
                <p className="text-sm font-bold text-oro-700">{precio(p.precio)}</p>
              </div>
              <button type="button" onClick={() => alAgregar(document.querySelector("[data-foto-principal]"))} className="btn-oro !px-5 !py-3">
                Agregar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
