"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EVENTO_ATERRIZAJE, EVENTO_VUELO, type DetalleVuelo } from "@/lib/vuelo";

interface Vuelo extends DetalleVuelo {
  id: number;
  destinoX: number;
  destinoY: number;
}

/** Dibuja la foto de la joya volando en arco hasta el ícono del pedido. */
export function AnimacionVuelo() {
  const [vuelos, setVuelos] = useState<Vuelo[]>([]);

  useEffect(() => {
    let n = 0;
    function alVolar(e: Event) {
      const d = (e as CustomEvent<DetalleVuelo>).detail;
      const destino = document.getElementById("icono-carrito")?.getBoundingClientRect();
      const destinoX = destino ? destino.left + destino.width / 2 : window.innerWidth - 40;
      const destinoY = destino ? destino.top + destino.height / 2 : 40;
      setVuelos((v) => [...v, { ...d, id: ++n, destinoX, destinoY }]);
    }
    window.addEventListener(EVENTO_VUELO, alVolar);
    return () => window.removeEventListener(EVENTO_VUELO, alVolar);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      <AnimatePresence>
        {vuelos.map((v) => {
          const lado = Math.min(v.ancho, 160);
          const alto = lado * 1.25;
          const x0 = v.x + v.ancho / 2 - lado / 2;
          const y0 = v.y + v.alto / 2 - alto / 2;
          const x1 = v.destinoX - lado / 2;
          const y1 = v.destinoY - alto / 2;
          return (
            <motion.img
              key={v.id}
              src={v.src}
              alt=""
              className="absolute left-0 top-0 rounded-2xl object-cover shadow-[0_20px_50px_-10px_rgba(201,155,60,.7)] ring-2 ring-oro-300"
              style={{ width: lado, height: alto }}
              initial={{ x: x0, y: y0, scale: 1, opacity: 1, rotate: 0 }}
              animate={{
                x: [x0, (x0 + x1) / 2, x1],
                y: [y0, Math.min(y0, y1) - 140, y1],
                scale: [1, 0.7, 0.12],
                rotate: [0, -12, 20],
                opacity: [1, 1, 0.6],
              }}
              transition={{ duration: 0.85, ease: [0.55, 0, 0.35, 1] }}
              onAnimationComplete={() => {
                window.dispatchEvent(new Event(EVENTO_ATERRIZAJE));
                setVuelos((vs) => vs.filter((x) => x.id !== v.id));
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
