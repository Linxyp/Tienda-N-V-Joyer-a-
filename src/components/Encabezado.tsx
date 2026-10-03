"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { TIENDA } from "@/config/tienda";
import { asset, cn, precio } from "@/lib/utilidades";
import { EVENTO_ATERRIZAJE } from "@/lib/vuelo";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { unidadesCarrito, useCarrito } from "@/store/carrito";
import { useUI } from "@/store/ui";
import { IconoWhatsApp } from "./IconoWhatsApp";
import { Logo } from "./Logo";

export interface CategoriaMenu {
  id: string;
  nombre: string;
  lema: string;
  total: number;
  desde: number;
  portada: string;
}

const AVISOS = [
  "Envíos a toda Colombia",
  "Paga con Nequi, Daviplata o Llave",
  "Garantía de hasta 5 años",
  `Pedidos por WhatsApp · ${TIENDA.whatsappVisible}`,
];

function BarraAvisos() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % AVISOS.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-9 overflow-hidden border-b border-oro-500/15 bg-noche text-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -18, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 grid place-items-center truncate px-4 text-[0.62rem] font-semibold tracking-[0.16em] text-oro-200 uppercase sm:text-[0.68rem] sm:tracking-[0.22em]"
        >
          {AVISOS[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function BotonCarrito() {
  const items = useCarrito((s) => s.items);
  const abrir = useCarrito((s) => s.abrir);
  const n = unidadesCarrito(items);
  const [salto, setSalto] = useState(0);
  useEffect(() => {
    const f = () => setSalto((x) => x + 1);
    window.addEventListener(EVENTO_ATERRIZAJE, f);
    return () => window.removeEventListener(EVENTO_ATERRIZAJE, f);
  }, []);
  return (
    <motion.button
      id="icono-carrito"
      key={salto}
      type="button"
      onClick={abrir}
      animate={salto ? { scale: [1, 1.25, 0.92, 1.05, 1], rotate: [0, -8, 6, 0] } : undefined}
      transition={{ duration: 0.6 }}
      className="relative grid size-11 place-items-center rounded-full border border-oro-400/40 bg-white/5 text-oro-100 transition-colors hover:border-oro-300 hover:bg-oro-400/15"
      aria-label={`Ver mi pedido (${n} ${n === 1 ? "joya" : "joyas"})`}
    >
      <ShoppingBag className="size-5" strokeWidth={1.6} />
      <AnimatePresence>
        {n > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fondo-oro absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.68rem] font-extrabold text-onix shadow"
          >
            {n}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function Encabezado({ categorias }: { categorias: CategoriaMenu[] }) {
  const ruta = usePathname();
  const [scroll, setScroll] = useState(false);
  const [mega, setMega] = useState(false);
  const abrirBuscador = useUI((s) => s.abrirBuscador);
  const menu = useUI((s) => s.menu);
  const alternarMenu = useUI((s) => s.alternarMenu);

  useEffect(() => {
    const f = () => setScroll(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  // Al cambiar de página se cierra el menú móvil
  useEffect(() => {
    alternarMenu(false);
  }, [ruta, alternarMenu]);

  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const enlaces = [
    { href: "/", texto: "Inicio" },
    { href: "/tienda/", texto: "Tienda" },
    { href: "/#como-comprar", texto: "Cómo comprar" },
    { href: "/#preguntas", texto: "Preguntas" },
  ];

  return (
    <>
      <BarraAvisos />
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-500",
          scroll
            ? "border-oro-500/20 bg-onix/88 shadow-[0_12px_40px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl"
            : "border-transparent bg-onix",
        )}
      >
        <div className={cn("mx-auto flex max-w-7xl items-center gap-4 px-5 transition-all duration-500 lg:px-8", scroll ? "h-16" : "h-[4.5rem]")}>
          <Logo />

          <nav className="ml-8 hidden items-center gap-1 lg:flex" aria-label="Principal">
            {enlaces.slice(0, 1).map((e) => (
              <EnlaceNav key={e.href} {...e} activo={ruta === e.href} />
            ))}
            <div className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
              <Link
                href="/tienda/"
                className={cn(
                  "flex items-center gap-1 rounded-full px-4 py-2 text-[0.78rem] font-semibold tracking-[0.16em] uppercase transition-colors",
                  ruta.startsWith("/tienda") ? "text-oro-300" : "text-marfil/80 hover:text-oro-200",
                )}
                aria-expanded={mega}
              >
                Colección <ChevronDown className={cn("size-3.5 transition-transform", mega && "rotate-180")} />
              </Link>
              <AnimatePresence>
                {mega && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, rotateX: -12 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformPerspective: 900, transformOrigin: "top center" }}
                    className="absolute left-1/2 top-full w-[46rem] -translate-x-1/2 pt-3"
                  >
                    <div className="borde-oro grid grid-cols-3 gap-2 rounded-3xl bg-noche/95 p-4 shadow-2xl backdrop-blur-xl">
                      {categorias.map((c) => (
                        <Link
                          key={c.id}
                          href={`/tienda/${c.id}/`}
                          onClick={() => setMega(false)}
                          className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-white/5"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset(c.portada)}
                            alt=""
                            width={56}
                            height={70}
                            loading="lazy"
                            className="h-[4.2rem] w-14 rounded-xl object-cover ring-1 ring-oro-500/30 transition-transform duration-500 group-hover:scale-105"
                          />
                          <span>
                            <span className="block font-display text-lg leading-tight text-marfil group-hover:text-oro-200">
                              {c.nombre}
                            </span>
                            <span className="text-[0.7rem] text-niebla">
                              {c.total} diseños · desde {precio(c.desde)}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {enlaces.slice(2).map((e) => (
              <EnlaceNav key={e.href} {...e} activo={false} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={abrirBuscador}
              className="hidden h-11 items-center gap-3 rounded-full border border-white/10 bg-white/5 pl-4 pr-2 text-sm text-niebla transition-colors hover:border-oro-400/50 hover:text-marfil md:flex"
            >
              <Search className="size-4" /> Buscar joyas
              <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[0.65rem] text-niebla/80">Ctrl K</kbd>
            </button>
            <button
              type="button"
              onClick={abrirBuscador}
              className="grid size-11 place-items-center rounded-full text-oro-100 hover:bg-white/5 md:hidden"
              aria-label="Buscar joyas"
            >
              <Search className="size-5" strokeWidth={1.6} />
            </button>
            <BotonCarrito />
            <button
              type="button"
              onClick={() => alternarMenu()}
              className="grid size-11 place-items-center rounded-full text-oro-100 hover:bg-white/5 lg:hidden"
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menu}
            >
              {menu ? <X className="size-6" /> : <Menu className="size-6" strokeWidth={1.6} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] overflow-y-auto bg-onix/97 px-5 pb-10 backdrop-blur-xl lg:hidden"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
          >
            <div className="sticky top-0 z-10 -mx-5 flex h-[4.5rem] items-center justify-between bg-onix/90 px-5 backdrop-blur">
              <Logo />
              <button
                type="button"
                onClick={() => alternarMenu(false)}
                className="grid size-11 place-items-center rounded-full border border-oro-400/40 text-oro-100"
                aria-label="Cerrar menú"
              >
                <X className="size-6" />
              </button>
            </div>
            <nav className="flex flex-col" aria-label="Menú móvil">
              {enlaces.map((e, i) => (
                <motion.div key={e.href} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <Link href={e.href} onClick={() => alternarMenu(false)} className="block border-b border-white/5 py-4 font-display text-3xl text-marfil">
                    {e.texto}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <p className="ceja mt-8 text-oro-400">Categorías</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {categorias.map((c, i) => (
                <motion.div key={c.id} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.04 }}>
                  <Link href={`/tienda/${c.id}/`} onClick={() => alternarMenu(false)} className="borde-oro relative block overflow-hidden rounded-2xl bg-carbon">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(c.portada)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover opacity-80" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-onix via-onix/70 to-transparent p-3 pt-8">
                      <span className="block font-display text-lg leading-none text-marfil">{c.nombre}</span>
                      <span className="text-[0.68rem] text-niebla">{c.total} diseños</span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
            <a
              href={enlaceWhatsApp(`Hola ${TIENDA.nombre}, quiero hacer una consulta.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-8 w-full"
            >
              <IconoWhatsApp className="size-5" /> Escríbenos · {TIENDA.whatsappVisible}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EnlaceNav({ href, texto, activo }: { href: string; texto: string; activo: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-full px-4 py-2 text-[0.78rem] font-semibold tracking-[0.16em] uppercase transition-colors",
        activo ? "text-oro-300" : "text-marfil/80 hover:text-oro-200",
      )}
    >
      {texto}
      {activo && <motion.span layoutId="nav-activo" className="absolute inset-x-4 -bottom-0.5 h-px bg-oro-400" />}
    </Link>
  );
}
