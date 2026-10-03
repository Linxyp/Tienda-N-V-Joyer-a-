"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Aparece al entrar en pantalla con una leve rotación 3D (efecto "carta que se levanta"). */
export function Revelar({
  children,
  retraso = 0,
  className,
  como = "div",
}: {
  children: ReactNode;
  retraso?: number;
  className?: string;
  como?: "div" | "section" | "li";
}) {
  const reducir = useReducedMotion();
  const Comp = motion[como];
  return (
    <Comp
      className={className}
      initial={reducir ? false : { opacity: 0, y: 36, rotateX: 14, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 900 }}
    >
      {children}
    </Comp>
  );
}
