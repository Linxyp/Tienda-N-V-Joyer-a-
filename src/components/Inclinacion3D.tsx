"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utilidades";

/**
 * Tarjeta que se inclina en 3D siguiendo el puntero, con un reflejo dorado que recorre la superficie.
 * En pantallas táctiles queda quieta (no hay "hover").
 */
export function Inclinacion3D({
  children,
  className,
  grados = 10,
  reflejo = true,
}: {
  children: ReactNode;
  className?: string;
  grados?: number;
  reflejo?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const suave = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotY = useSpring(useTransform(px, [0, 1], [-grados, grados]), suave);
  const rotX = useSpring(useTransform(py, [0, 1], [grados, -grados]), suave);
  const brilloX = useTransform(px, [0, 1], [0, 100]);
  const brilloY = useTransform(py, [0, 1], [0, 100]);
  const fondoReflejo = useMotionTemplate`radial-gradient(circle at ${brilloX}% ${brilloY}%, rgba(255,240,200,.38), rgba(255,240,200,0) 55%)`;
  const opacidad = useSpring(0, { stiffness: 120, damping: 20 });

  function mover(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    opacidad.set(1);
  }
  function salir() {
    px.set(0.5);
    py.set(0.5);
    opacidad.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={mover}
      onPointerLeave={salir}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 900, transformStyle: "preserve-3d" }}
      className={cn("relative will-change-transform", className)}
    >
      {children}
      {reflejo && (
        <motion.span
          aria-hidden
          style={{ background: fondoReflejo, opacity: opacidad }}
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-soft-light"
        />
      )}
    </motion.div>
  );
}
