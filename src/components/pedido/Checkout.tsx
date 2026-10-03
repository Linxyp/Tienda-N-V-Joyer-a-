"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CircleCheck, Lock, MapPin, Minus, Plus, ReceiptText, Send, ShoppingBag, Trash, User } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { METODOS_PAGO, metodoPorId, TIENDA, type MetodoPagoId } from "@/config/tienda";
import { asset, cn, precio } from "@/lib/utilidades";
import { enlaceWhatsApp, mensajePedido, numeroPedido, textoOpciones, type DatosCliente } from "@/lib/whatsapp";
import { totalCarrito, unidadesCarrito, useCarrito } from "@/store/carrito";
import { IconoWhatsApp } from "../IconoWhatsApp";
import { BotonCopiar, MarcaPago } from "../MetodosPago";

const DEPARTAMENTOS = [
  "Bogotá D.C.", "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare",
  "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta",
  "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre",
  "Tolima", "Valle del Cauca", "Vaupés", "Vichada",
];

const VACIO: DatosCliente = { nombre: "", celular: "", departamento: "", ciudad: "", direccion: "", barrio: "", notas: "" };
const CLAVE_DATOS = "nv-datos-envio";

type Errores = Partial<Record<keyof DatosCliente | "pago", string>>;

function validar(d: DatosCliente, pago: MetodoPagoId | null): Errores {
  const e: Errores = {};
  if (d.nombre.trim().length < 3) e.nombre = "Escribe tu nombre completo";
  const cel = d.celular.replace(/\D/g, "").replace(/^57(?=3\d{9}$)/, "");
  if (!/^3\d{9}$/.test(cel)) e.celular = "Celular de 10 dígitos que empiece por 3";
  if (!d.departamento) e.departamento = "Elige el departamento";
  if (d.ciudad.trim().length < 2) e.ciudad = "Escribe la ciudad o municipio";
  if (d.direccion.trim().length < 6) e.direccion = "Escribe la dirección completa";
  if (!pago) e.pago = "Elige cómo vas a pagar";
  return e;
}

const suscribirHidratacion = (aviso: () => void) => useCarrito.persist.onFinishHydration(aviso);

/** Datos de envío recordados en este navegador (para no volver a escribirlos en el próximo pedido). */
function leerDatosGuardados(): DatosCliente {
  try {
    const guardado = localStorage.getItem(CLAVE_DATOS);
    return guardado ? { ...VACIO, ...JSON.parse(guardado) } : VACIO;
  } catch {
    return VACIO;
  }
}

export function Checkout() {
  const { items, cambiarCantidad, quitar, vaciar, registrarPedido, ultimoPedido } = useCarrito();
  // Espera a que el carrito se cargue del navegador antes de mostrar "pedido vacío"
  const hidratado = useSyncExternalStore(suscribirHidratacion, () => useCarrito.persist.hasHydrated(), () => false);
  const [datos, setDatos] = useState<DatosCliente>(leerDatosGuardados);
  const [pago, setPago] = useState<MetodoPagoId | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [enviado, setEnviado] = useState<{ numero: string; enlace: string; total: number; pago: MetodoPagoId } | null>(null);
  const total = totalCarrito(items);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_DATOS, JSON.stringify({ ...datos, notas: "" }));
    } catch {}
  }, [datos]);

  const campo = (k: keyof DatosCliente) => ({
    value: datos[k] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setDatos((d) => ({ ...d, [k]: e.target.value }));
      if (errores[k]) setErrores((er) => ({ ...er, [k]: undefined }));
    },
    "aria-invalid": Boolean(errores[k]),
  });

  const lineas = useMemo(
    () => items.map((i) => ({ nombre: i.nombre, sku: i.sku, precio: i.precio, cantidad: i.cantidad, opciones: i.opciones })),
    [items],
  );

  function enviar() {
    const e = validar(datos, pago);
    setErrores(e);
    if (Object.keys(e).length) {
      const primero = document.querySelector("[aria-invalid='true'], [data-error-pago='true']");
      primero?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const numero = numeroPedido();
    const cliente = { ...datos, celular: datos.celular.replace(/\D/g, "").replace(/^57(?=3\d{9}$)/, "") };
    const mensaje = mensajePedido({ numero, lineas, cliente, pago: pago! });
    const enlace = enlaceWhatsApp(mensaje);
    registrarPedido({ numero, fecha: new Date().toISOString(), total, pago: pago!, mensaje });
    setEnviado({ numero, enlace, total, pago: pago! });
    window.open(enlace, "_blank", "noopener,noreferrer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (enviado) return <Confirmacion {...enviado} alTerminar={vaciar} />;

  if (!hidratado) {
    return (
      // Alto reservado para que el pie de página no "salte" cuando aparece el formulario
      <div key="cargando" className="flex min-h-[75vh] justify-center pt-24">
        <span className="size-10 animate-spin rounded-full border-2 border-oro-400 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div key="vacio" className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center gap-5 py-16 text-center">
        <div className="grid size-24 place-items-center rounded-full bg-perla">
          <ShoppingBag className="size-10 text-oro-500" strokeWidth={1.2} />
        </div>
        <h1 className="font-display text-4xl text-tinta">Tu pedido está vacío</h1>
        <p className="text-piedra">Agrega las joyas que te encanten y vuelve aquí para enviarnos tu pedido por WhatsApp.</p>
        <Link href="/tienda/" className="btn-oro">
          Ir a la tienda <ArrowRight className="size-4" />
        </Link>
        {ultimoPedido && (
          <p className="text-sm text-piedra">
            Tu último pedido fue el <strong>{ultimoPedido.numero}</strong> por {precio(ultimoPedido.total)}.{" "}
            <a href={enlaceWhatsApp(`Hola ${TIENDA.nombre}, quiero saber el estado de mi pedido ${ultimoPedido.numero}.`)} target="_blank" rel="noopener noreferrer" className="font-semibold text-oro-700 underline">
              Preguntar por él
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div key="formulario" className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
      <div className="space-y-8">
        {/* 1. Datos */}
        <Paso numero={1} titulo="¿A dónde enviamos tus joyas?" icono={<User className="size-5" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre completo" error={errores.nombre} className="sm:col-span-2">
              <input className="campo" autoComplete="name" placeholder="Ej: María Fernanda Gómez" {...campo("nombre")} />
            </Campo>
            <Campo etiqueta="Celular (WhatsApp)" error={errores.celular}>
              <input className="campo" type="tel" inputMode="tel" autoComplete="tel" placeholder="300 123 4567" {...campo("celular")} />
            </Campo>
            <Campo etiqueta="Departamento" error={errores.departamento}>
              <select className="campo cursor-pointer" {...campo("departamento")}>
                <option value="">Elige…</option>
                {DEPARTAMENTOS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Ciudad o municipio" error={errores.ciudad}>
              <input className="campo" autoComplete="address-level2" placeholder="Ej: Bogotá" {...campo("ciudad")} />
            </Campo>
            <Campo etiqueta="Barrio (opcional)">
              <input className="campo" placeholder="Ej: Chapinero" {...campo("barrio")} />
            </Campo>
            <Campo etiqueta="Dirección completa" error={errores.direccion} className="sm:col-span-2">
              <input className="campo" autoComplete="street-address" placeholder="Calle, número, apto, torre, conjunto…" {...campo("direccion")} />
            </Campo>
            <Campo etiqueta="Notas para tu pedido (opcional)" className="sm:col-span-2">
              <textarea className="campo min-h-24 resize-y" placeholder="¿Es un regalo? ¿Horario para recibir? Cuéntanos." {...campo("notas")} />
            </Campo>
          </div>
        </Paso>

        {/* 2. Pago */}
        <Paso numero={2} titulo="¿Cómo vas a pagar?" icono={<ReceiptText className="size-5" />}>
          <div className="grid gap-3 sm:grid-cols-3" data-error-pago={Boolean(errores.pago)}>
            {METODOS_PAGO.map((m) => {
              const activo = pago === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setPago(m.id);
                    setErrores((er) => ({ ...er, pago: undefined }));
                  }}
                  aria-pressed={activo}
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300",
                    activo ? "scale-[1.02] shadow-[0_20px_40px_-20px_rgba(0,0,0,.7)] ring-2 ring-oro-400" : "opacity-85 ring-1 ring-black/10 hover:opacity-100",
                  )}
                  style={{ background: m.color }}
                >
                  <span className="flex items-center justify-between">
                    <MarcaPago m={m} className="text-lg" />
                    <span className={cn("grid size-5 place-items-center rounded-full border-2", activo ? "border-oro-300 bg-oro-300" : "border-white/40")}>
                      {activo && <span className="size-2 rounded-full bg-onix" />}
                    </span>
                  </span>
                  <span className="mt-4 block font-mono text-lg font-bold tracking-wider text-white">{m.numeroVisible}</span>
                </button>
              );
            })}
          </div>
          {errores.pago && <p className="mt-2 text-sm font-semibold text-orange-700">{errores.pago}</p>}
          <AnimatePresence mode="wait">
            {pago && (
              <motion.div
                key={pago}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex flex-col gap-3 rounded-2xl bg-perla p-4 text-sm text-piedra sm:flex-row sm:items-center sm:justify-between"
              >
                <p>{metodoPorId(pago).instrucciones}</p>
                <BotonCopiar texto={metodoPorId(pago).numero} etiqueta="Copiar número" className="shrink-0 self-start bg-onix text-oro-100 hover:bg-carbon" />
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-4 flex items-start gap-2 text-xs text-piedra">
            <Lock className="mt-0.5 size-3.5 shrink-0" />
            Primero te confirmamos disponibilidad y el valor del envío por WhatsApp; después haces la transferencia y nos envías el comprobante.
          </p>
        </Paso>
      </div>

      {/* Resumen */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_70px_-40px_rgba(80,55,15,.6)] ring-1 ring-arena">
          <div className="grano relative bg-onix px-6 py-5 text-marfil">
            <p className="ceja text-oro-300">Resumen</p>
            <p className="mt-1 font-display text-2xl">
              {unidadesCarrito(items)} {unidadesCarrito(items) === 1 ? "joya" : "joyas"}
            </p>
          </div>
          <ul className="max-h-[42vh] divide-y divide-arena/70 overflow-y-auto px-5" data-lenis-prevent>
            {items.map((i) => {
              const op = textoOpciones(i.opciones);
              return (
                <li key={i.clave} className="flex gap-3 py-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(i.foto)} alt="" className="h-20 w-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-tinta">{i.nombre}</p>
                      <button type="button" onClick={() => quitar(i.clave)} className="text-piedra hover:text-red-700" aria-label={`Quitar ${i.nombre}`}>
                        <Trash className="size-4" />
                      </button>
                    </div>
                    {op && <p className="text-xs text-piedra">{op}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full ring-1 ring-arena">
                        <button type="button" onClick={() => cambiarCantidad(i.clave, i.cantidad - 1)} disabled={i.cantidad <= 1} className="grid size-7 place-items-center disabled:opacity-30" aria-label="Una menos">
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{i.cantidad}</span>
                        <button type="button" onClick={() => cambiarCantidad(i.clave, i.cantidad + 1)} className="grid size-7 place-items-center" aria-label="Una más">
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-oro-700">{precio(i.precio * i.cantidad)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="space-y-3 border-t border-arena bg-perla/50 px-6 py-5">
            <div className="flex justify-between text-sm text-piedra">
              <span>Subtotal</span>
              <span>{precio(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-piedra">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Envío
              </span>
              <span>Se confirma por WhatsApp</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-arena pt-3">
              <span className="font-semibold text-tinta">Total productos</span>
              <span className="font-display text-3xl font-semibold text-tinta">{precio(total)}</span>
            </div>
            <button type="button" onClick={enviar} className="btn-whatsapp mt-2 h-14 w-full text-[0.85rem]">
              <IconoWhatsApp className="size-5" /> Enviar pedido por WhatsApp
            </button>
            <p className="text-center text-xs text-piedra">Se abrirá WhatsApp con tu pedido listo para enviar al {TIENDA.whatsappVisible}.</p>
          </div>
        </div>
        <Link href="/tienda/" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-oro-700 hover:underline">
          <ArrowLeft className="size-4" /> Seguir comprando
        </Link>
      </aside>
    </div>
  );
}

function Paso({ numero, titulo, icono, children }: { numero: number; titulo: string; icono: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] bg-white p-6 shadow-[0_20px_50px_-40px_rgba(80,55,15,.5)] ring-1 ring-arena sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="fondo-oro grid size-11 shrink-0 place-items-center rounded-full text-onix shadow">{icono}</span>
        <div>
          <p className="ceja text-oro-700">Paso {numero}</p>
          <h2 className="font-display text-2xl leading-tight text-tinta sm:text-3xl">{titulo}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Campo({ etiqueta, error, className, children }: { etiqueta: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold text-tinta">{etiqueta}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-semibold text-orange-700">{error}</span>}
    </label>
  );
}

function Confirmacion({
  numero,
  enlace,
  total,
  pago,
  alTerminar,
}: {
  numero: string;
  enlace: string;
  total: number;
  pago: MetodoPagoId;
  alTerminar: () => void;
}) {
  const m = metodoPorId(pago);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1000 }}
      className="mx-auto max-w-2xl"
    >
      <div className="overflow-hidden rounded-[32px] bg-white text-center shadow-[0_40px_90px_-40px_rgba(80,55,15,.6)] ring-1 ring-arena">
        <div className="grano relative bg-onix px-6 py-10 text-marfil">
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }} className="fondo-oro mx-auto grid size-20 place-items-center rounded-full text-onix shadow-[0_0_50px_-5px_rgba(220,180,85,.8)]">
            <CircleCheck className="size-10" />
          </motion.div>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl">¡Pedido listo!</h1>
          <p className="mt-2 text-niebla">
            Número de pedido <strong className="text-oro-200">{numero}</strong>
          </p>
        </div>
        <div className="space-y-6 p-6 sm:p-10">
          <ol className="space-y-4 text-left">
            {[
              { t: "Envía el mensaje en WhatsApp", d: "Se abrió un chat con tu pedido escrito. Solo presiona enviar." },
              { t: "Te confirmamos", d: "Revisamos disponibilidad y te decimos el valor del envío a tu ciudad." },
              { t: `Paga por ${m.nombre}`, d: `Transfiere ${precio(total)} + envío al ${m.numeroVisible} y mándanos el comprobante.` },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-onix text-sm font-bold text-oro-200">{i + 1}</span>
                <span>
                  <strong className="block text-tinta">{s.t}</strong>
                  <span className="text-sm text-piedra">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl p-4 sm:flex-row" style={{ background: m.color }}>
            <span className="text-left">
              <MarcaPago m={m} className="text-lg" />
              <span className="block font-mono text-2xl font-bold tracking-wider text-white">{m.numeroVisible}</span>
            </span>
            <BotonCopiar texto={m.numero} etiqueta="Copiar número" className="bg-white/15 text-white hover:bg-white/25" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={enlace} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-1">
              <Send className="size-4" /> Abrir WhatsApp de nuevo
            </a>
            <Link href="/tienda/" onClick={alTerminar} className="btn-oro flex-1">
              Terminar y seguir viendo
            </Link>
          </div>
          <p className="text-xs text-piedra">¿No se abrió WhatsApp? Toca “Abrir WhatsApp de nuevo” o escríbenos al {TIENDA.whatsappVisible}.</p>
        </div>
      </div>
    </motion.div>
  );
}
