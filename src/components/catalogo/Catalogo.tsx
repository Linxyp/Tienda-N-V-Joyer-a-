"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpDown, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CATEGORIAS, categoriaPorId, type CategoriaId } from "@/config/categorias";
import { buscar, cargarCatalogo } from "@/lib/busqueda";
import type { ProductoResumen } from "@/lib/tipos";
import { cn } from "@/lib/utilidades";
import { TarjetaProducto } from "../TarjetaProducto";

type Orden = "destacados" | "nuevos" | "precio-asc" | "precio-desc" | "nombre";

const ORDENES: { id: Orden; texto: string }[] = [
  { id: "destacados", texto: "Destacados" },
  { id: "nuevos", texto: "Novedades" },
  { id: "precio-asc", texto: "Precio: menor a mayor" },
  { id: "precio-desc", texto: "Precio: mayor a menor" },
  { id: "nombre", texto: "Nombre A–Z" },
];

const RANGOS = [
  { id: "r1", texto: "Hasta $80.000", min: 0, max: 80000 },
  { id: "r2", texto: "$80.000 – $150.000", min: 80001, max: 150000 },
  { id: "r3", texto: "$150.000 – $300.000", min: 150001, max: 300000 },
  { id: "r4", texto: "Más de $300.000", min: 300001, max: Infinity },
];

// Los filtros viven en la URL (?q=, ?sub=, ?premium=1, ?para=hombre, ?rango=, ?orden=):
// se pueden compartir y no generan diferencias entre el HTML estático y el navegador.
interface Filtros {
  q: string;
  sub: string | null;
  premium: boolean;
  hombre: boolean;
  rango: string | null;
  orden: Orden;
}

const EVENTO_URL = "nv:filtros";

function suscribirURL(aviso: () => void) {
  window.addEventListener("popstate", aviso);
  window.addEventListener(EVENTO_URL, aviso);
  return () => {
    window.removeEventListener("popstate", aviso);
    window.removeEventListener(EVENTO_URL, aviso);
  };
}

function leerFiltros(busqueda: string): Filtros {
  const u = new URLSearchParams(busqueda);
  const o = u.get("orden") as Orden | null;
  return {
    q: u.get("q") ?? "",
    sub: u.get("sub"),
    premium: u.get("premium") === "1",
    hombre: u.get("para") === "hombre",
    rango: u.get("rango"),
    orden: o && ORDENES.some((x) => x.id === o) ? o : "destacados",
  };
}

function useFiltrosURL() {
  const busqueda = useSyncExternalStore(
    suscribirURL,
    () => window.location.search,
    () => "",
  );
  return useMemo(() => leerFiltros(busqueda), [busqueda]);
}

function escribirFiltros(cambios: Partial<Filtros>) {
  const f = { ...leerFiltros(window.location.search), ...cambios };
  const u = new URLSearchParams();
  if (f.q) u.set("q", f.q);
  if (f.sub) u.set("sub", f.sub);
  if (f.premium) u.set("premium", "1");
  if (f.hombre) u.set("para", "hombre");
  if (f.rango) u.set("rango", f.rango);
  if (f.orden !== "destacados") u.set("orden", f.orden);
  const s = u.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${s ? `?${s}` : ""}`);
  window.dispatchEvent(new Event(EVENTO_URL));
}

const POR_PAGINA = 24;

export function Catalogo({
  categoria,
  iniciales,
  total,
}: {
  categoria?: CategoriaId;
  iniciales: ProductoResumen[];
  total: number;
}) {
  const cat = categoria ? categoriaPorId(categoria) : undefined;
  const [todos, setTodos] = useState<ProductoResumen[] | null>(null);
  const [mostrar, setMostrar] = useState(POR_PAGINA);
  const [filtrosMovil, setFiltrosMovil] = useState(false);
  const centinela = useRef<HTMLDivElement>(null);
  const { q, sub, premium, hombre, rango, orden } = useFiltrosURL();

  const cambiar = (c: Partial<Filtros>) => {
    escribirFiltros(c);
    setMostrar(POR_PAGINA);
  };

  // El índice completo (para filtrar, ordenar y seguir cargando) se descarga cuando el navegador queda libre,
  // o de inmediato si la persona ya está filtrando o llegó al final de las primeras joyas.
  const [ocioso, setOcioso] = useState(false);
  const filtrando = Boolean(q.trim() || sub || premium || hombre || rango || orden !== "destacados");
  useEffect(() => {
    const listo = () => setOcioso(true);
    const enReposo = () => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(listo, { timeout: 2500 });
      else setTimeout(listo, 600);
    };
    if (document.readyState === "complete") enReposo();
    else window.addEventListener("load", enReposo, { once: true });
    return () => window.removeEventListener("load", enReposo);
  }, []);
  useEffect(() => {
    if (!ocioso && !filtrando) return;
    let vigente = true;
    cargarCatalogo()
      .then((lista) => vigente && setTodos(categoria ? lista.filter((p) => p.categoria === categoria) : lista))
      .catch(() => vigente && setTodos(null));
    return () => {
      vigente = false;
    };
  }, [ocioso, filtrando, categoria]);

  const base = todos ?? iniciales;
  const filtrados = useMemo(() => {
    let l = q.trim() ? buscar(base, q) : base;
    if (sub) l = l.filter((p) => p.sub === sub);
    if (premium) l = l.filter((p) => p.premium);
    if (hombre) l = l.filter((p) => p.etiquetas.includes("hombre") || (p.categoria === "cadenas" && p.sub === "65"));
    const r = RANGOS.find((x) => x.id === rango);
    if (r) l = l.filter((p) => p.precio >= r.min && p.precio <= r.max);
    const copia = [...l];
    switch (orden) {
      case "precio-asc":
        return copia.sort((a, b) => a.precio - b.precio);
      case "precio-desc":
        return copia.sort((a, b) => b.precio - a.precio);
      case "nombre":
        return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      case "nuevos":
        return copia.sort((a, b) => Number(!!b.nuevo) - Number(!!a.nuevo) || a.orden - b.orden);
      default:
        return q.trim() ? copia : copia.sort((a, b) => a.orden - b.orden);
    }
  }, [base, q, sub, premium, hombre, rango, orden]);

  const cargando = !todos && filtrando;
  const visibles = filtrados.slice(0, mostrar);
  const hayMas = todos ? mostrar < filtrados.length : iniciales.length < total;

  // Scroll infinito
  useEffect(() => {
    const el = centinela.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOcioso(true);
        setMostrar((m) => m + POR_PAGINA);
      },
      { rootMargin: "900px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtrados.length]);

  const activos = [sub, premium, hombre, rango].filter(Boolean).length + (q.trim() ? 1 : 0);
  const limpiar = () => cambiar({ q: "", sub: null, premium: false, hombre: false, rango: null, orden: "destacados" });

  const filtros = (
    <div className="space-y-7">
      {cat?.subs && (
        <GrupoFiltro titulo={cat.id === "cadenas" ? "Largo" : "Tipo"}>
          <Chip activo={!sub} onClick={() => cambiar({ sub: null })}>
            Todos
          </Chip>
          {cat.subs.map((s) => (
            <Chip key={s.id} activo={sub === s.id} onClick={() => cambiar({ sub: sub === s.id ? null : s.id })}>
              {s.nombre}
            </Chip>
          ))}
        </GrupoFiltro>
      )}
      <GrupoFiltro titulo="Precio">
        {RANGOS.map((r) => (
          <Chip key={r.id} activo={rango === r.id} onClick={() => cambiar({ rango: rango === r.id ? null : r.id })}>
            {r.texto}
          </Chip>
        ))}
      </GrupoFiltro>
      <GrupoFiltro titulo="Colecciones">
        <Chip activo={premium} onClick={() => cambiar({ premium: !premium })}>
          <Sparkles className="size-3.5" /> Línea Premium
        </Chip>
        <Chip activo={hombre} onClick={() => cambiar({ hombre: !hombre })}>
          Para él
        </Chip>
      </GrupoFiltro>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      {/* Categorías */}
      <nav className="ocultar-scroll -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0" aria-label="Categorías">
        <CategoriaChip href="/tienda/" activo={!categoria}>
          Todo
        </CategoriaChip>
        {CATEGORIAS.map((c) => (
          <CategoriaChip key={c.id} href={`/tienda/${c.id}/`} activo={categoria === c.id}>
            {c.nombre}
          </CategoriaChip>
        ))}
      </nav>

      {/* Barra de búsqueda y orden */}
      <div className="sticky top-16 z-30 -mx-5 mt-5 border-y border-arena/70 bg-marfil/90 px-5 py-3 backdrop-blur-xl lg:mx-0 lg:rounded-2xl lg:border lg:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-piedra" />
            <input
              value={q}
              onChange={(e) => cambiar({ q: e.target.value })}
              placeholder={cat ? `Buscar en ${cat.nombre.toLowerCase()}…` : "Buscar por nombre, estilo o referencia…"}
              className="campo !rounded-full !py-2.5 pl-11"
              aria-label="Buscar en la tienda"
              enterKeyHint="search"
            />
            {q && (
              <button type="button" onClick={() => cambiar({ q: "" })} className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-perla" aria-label="Borrar búsqueda">
                <X className="size-4" />
              </button>
            )}
          </label>
          <label className="relative hidden sm:block">
            <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-piedra" />
            <select
              value={orden}
              onChange={(e) => cambiar({ orden: e.target.value as Orden })}
              className="campo !w-auto cursor-pointer !rounded-full !py-2.5 pl-10 pr-4"
              aria-label="Ordenar"
            >
              {ORDENES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.texto}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setFiltrosMovil(true)}
            className="relative grid size-11 shrink-0 place-items-center rounded-full bg-onix text-oro-200 lg:hidden"
            aria-label="Filtros"
          >
            <SlidersHorizontal className="size-5" />
            {activos > 0 && (
              <span className="fondo-oro absolute -right-1 -top-1 grid size-5 place-items-center rounded-full text-[0.65rem] font-bold text-onix">{activos}</span>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-40">{filtros}</div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-piedra">
              {cargando ? "Cargando joyas…" : `${(todos ? filtrados.length : total).toLocaleString("es-CO")} joyas`}
            </p>
            {activos > 0 && (
              <button type="button" onClick={limpiar} className="text-sm font-semibold text-oro-700 underline-offset-4 hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>

          <h2 className="sr-only">Joyas disponibles</h2>
          {visibles.length === 0 && !cargando ? (
            <div className="rounded-3xl bg-white p-12 text-center ring-1 ring-arena">
              <p className="font-display text-3xl text-tinta">No encontramos joyas con esos filtros</p>
              <p className="mt-3 text-piedra">Prueba con otra búsqueda o limpia los filtros.</p>
              <button type="button" onClick={limpiar} className="btn-oro mt-6">
                Ver todas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {visibles.map((p, i) => (
                // Entrada en CSS (no espera al JavaScript): las primeras tarjetas se ven de inmediato
                <div key={p.id} className="entrada-tarjeta" style={{ animationDelay: `${Math.min(i % POR_PAGINA, 8) * 0.04}s` }}>
                  <TarjetaProducto p={p} prioridad={i < 2} />
                </div>
              ))}
            </div>
          )}
          {hayMas && (
            <div ref={centinela} className="mt-10 flex justify-center">
              <span className="size-8 animate-spin rounded-full border-2 border-oro-300 border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      {/* Filtros en celular */}
      <AnimatePresence>
        {filtrosMovil && (
          <div className="fixed inset-0 z-[75] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
            <motion.button
              type="button"
              aria-label="Cerrar filtros"
              className="absolute inset-0 bg-onix/60 backdrop-blur-sm"
              onClick={() => setFiltrosMovil(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-marfil p-6 pb-8"
              data-lenis-prevent
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-arena" />
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-3xl text-tinta">Filtrar</p>
                <button type="button" onClick={() => setFiltrosMovil(false)} className="grid size-10 place-items-center rounded-full bg-perla" aria-label="Cerrar">
                  <X className="size-5" />
                </button>
              </div>
              <GrupoFiltro titulo="Ordenar por">
                {ORDENES.map((o) => (
                  <Chip key={o.id} activo={orden === o.id} onClick={() => cambiar({ orden: o.id })}>
                    {o.texto}
                  </Chip>
                ))}
              </GrupoFiltro>
              <div className="mt-7">{filtros}</div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button type="button" onClick={limpiar} className="rounded-full border border-arena py-3.5 text-sm font-bold text-tinta">
                  Limpiar
                </button>
                <button type="button" onClick={() => setFiltrosMovil(false)} className="btn-oro !py-3.5">
                  Ver {filtrados.length}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GrupoFiltro({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="ceja mb-3 text-oro-700">{titulo}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.82rem] font-semibold transition-all duration-300",
        activo ? "bg-onix text-oro-200 shadow-lg" : "bg-white text-tinta ring-1 ring-arena hover:ring-oro-400",
      )}
    >
      {children}
    </button>
  );
}

function CategoriaChip({ href, activo, children }: { href: string; activo: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  // En celular la fila se desplaza de lado: la categoría activa queda centrada a la vista
  useEffect(() => {
    const chip = ref.current;
    const fila = chip?.parentElement;
    if (!activo || !chip || !fila || fila.scrollWidth <= fila.clientWidth) return;
    const desfase = chip.getBoundingClientRect().left - fila.getBoundingClientRect().left;
    fila.scrollLeft += desfase - (fila.clientWidth - chip.offsetWidth) / 2;
  }, [activo]);
  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "shrink-0 rounded-full px-4 py-2.5 text-[0.75rem] font-bold tracking-[0.14em] uppercase transition-all duration-300",
        activo ? "fondo-oro text-onix shadow-[0_10px_24px_-10px_rgba(201,155,60,.8)]" : "bg-white text-piedra ring-1 ring-arena hover:text-tinta hover:ring-oro-400",
      )}
    >
      {children}
    </Link>
  );
}

