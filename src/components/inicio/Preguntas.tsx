"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TIENDA } from "@/config/tienda";
import { cn } from "@/lib/utilidades";
import { TituloSeccion } from "../TituloSeccion";

const PREGUNTAS = [
  {
    p: "¿Qué es el oro laminado 18K?",
    r: "Es una joya con base metálica recubierta con varias capas de oro de 18 quilates, unidas con calor y presión. Tiene el color y el brillo del oro a un precio mucho más accesible, y con buenos cuidados conserva su tono por años.",
  },
  {
    p: "¿Cómo hago mi pedido?",
    r: "Agrega tus joyas al pedido, escribe tus datos de envío y presiona “Enviar pedido por WhatsApp”. El mensaje llega completo a nuestro chat; ahí te confirmamos disponibilidad, valor del envío y tiempo de entrega.",
  },
  {
    p: "¿Cómo pago?",
    r: `Por Nequi, Daviplata o Llave Bre-B al número ${TIENDA.whatsappVisible}. Cuando confirmemos tu pedido, haces la transferencia y nos envías el comprobante por WhatsApp.`,
  },
  {
    p: "¿Hacen envíos a toda Colombia?",
    r: `Sí. Despachamos desde ${TIENDA.ciudad} a cualquier ciudad o municipio del país. El costo y el tiempo de entrega dependen del destino y te los confirmamos antes de pagar.`,
  },
  {
    p: "¿Qué garantía tienen las joyas?",
    r: "Nuestras piezas tienen garantía de hasta 5 años por cambio de tonalidad, según la referencia. En las pulseras en balines la garantía cubre los balines (no el hilo ni las cuentas). Si notas algún cambio, escríbenos con tu número de pedido y te ayudamos.",
  },
  {
    p: "¿Cómo cuido mis joyas para que duren más?",
    r: "Evita el contacto directo con perfumes, cremas, cloro y agua salada; quítatelas para dormir, bañarte o hacer ejercicio y guárdalas secas, por separado, en su estuche.",
  },
  {
    p: "¿Puedo elegir color, talla o letra?",
    r: "Sí. Cuando una joya tiene varias opciones (color del circón o del tejido, talla del anillo o las iniciales) te pedimos elegirla antes de agregarla, y queda escrita en tu pedido.",
  },
  {
    p: "¿Las pulseras en balines son ajustables?",
    r: "Se tejen a mano y la mayoría tiene cierre de nudo corredizo, así que se ajustan a tu muñeca sin broches. En cada ficha verás el tipo de tejido, el tamaño de los balines y los colores disponibles.",
  },
];

export function Preguntas() {
  const [abierta, setAbierta] = useState<number | null>(0);
  return (
    <section id="preguntas" className="bg-perla py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <TituloSeccion centrado ceja="Resolvemos tus dudas" titulo={<>Preguntas <em className="texto-oro">frecuentes</em></>} />
        <div className="space-y-3">
          {PREGUNTAS.map((q, i) => {
            const activa = abierta === i;
            return (
              <div key={q.p} className={cn("overflow-hidden rounded-2xl bg-white ring-1 transition-shadow", activa ? "shadow-xl ring-oro-300" : "ring-arena")}>
                <button
                  type="button"
                  onClick={() => setAbierta(activa ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={activa}
                >
                  <span className="font-display text-xl text-tinta sm:text-2xl">{q.p}</span>
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full transition-all duration-500", activa ? "fondo-oro rotate-45 text-onix" : "bg-perla text-oro-700")}>
                    <Plus className="size-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {activa && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-6 pb-6 leading-relaxed text-piedra">{q.r}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
