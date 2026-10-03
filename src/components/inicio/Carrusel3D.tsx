"use client";

import Link from "next/link";
import { motion, useAnimationFrame, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ProductoResumen } from "@/lib/tipos";
import { asset, precio } from "@/lib/utilidades";

/** Carrusel cilíndrico en 3D: gira solo, se arrastra con el dedo/mouse y frena con inercia. */
export function Carrusel3D({ productos }: { productos: ProductoResumen[] }) {
  const n = productos.length;
  const [ancho, setAncho] = useState(230);
  const angulo = useMotionValue(0);
  const estado = useRef({ arrastrando: false, x: 0, v: 0, movido: 0, pausa: false });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const f = () => setAncho(mq.matches ? 165 : 230);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  const radio = Math.round(ancho / 2 / Math.tan(Math.PI / n) + 28);
  const transform = useTransform(angulo, (a) => `translateZ(${-radio}px) rotateX(-7deg) rotateY(${a}deg)`);

  useAnimationFrame((_, dt) => {
    const e = estado.current;
    if (e.arrastrando) return;
    e.v *= 0.95; // inercia
    const auto = e.pausa ? 0 : 0.011 * Math.min(dt, 50);
    angulo.set(angulo.get() - auto + e.v);
  });

  function abajo(ev: React.PointerEvent) {
    const e = estado.current;
    e.arrastrando = true;
    e.x = ev.clientX;
    e.v = 0;
    e.movido = 0;
  }
  function mover(ev: React.PointerEvent) {
    const e = estado.current;
    if (!e.arrastrando) return;
    const dx = ev.clientX - e.x;
    e.x = ev.clientX;
    e.movido += Math.abs(dx);
    const delta = dx * 0.22;
    e.v = delta;
    angulo.set(angulo.get() + delta);
  }
  function arriba() {
    estado.current.arrastrando = false;
  }

  return (
    <div
      className="relative mx-auto select-none"
      style={{ perspective: 1100, perspectiveOrigin: "50% 30%", height: ancho * 1.62 + 70 }}
      onPointerEnter={(e) => e.pointerType === "mouse" && (estado.current.pausa = true)}
      onPointerLeave={() => {
        estado.current.pausa = false;
        estado.current.arrastrando = false;
      }}
    >
      <div
        className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
        onPointerDown={abajo}
        onPointerMove={mover}
        onPointerUp={arriba}
        onPointerCancel={arriba}
        onClickCapture={(e) => {
          if (estado.current.movido > 6) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <motion.div
          className="absolute left-1/2 top-6"
          style={{ width: ancho, marginLeft: -ancho / 2, transformStyle: "preserve-3d", transform }}
        >
          {productos.map((p, i) => (
            <Carta key={p.id} p={p} i={i} n={n} radio={radio} ancho={ancho} angulo={angulo} />
          ))}
        </motion.div>
      </div>
      {/* reflejo en el "piso" */}
      <div className="pointer-events-none absolute inset-x-[12%] bottom-2 h-12 rounded-[50%] bg-[radial-gradient(ellipse,rgba(201,155,60,.4),transparent_70%)] blur-md" />
    </div>
  );
}

function Carta({
  p,
  i,
  n,
  radio,
  ancho,
  angulo,
}: {
  p: ProductoResumen;
  i: number;
  n: number;
  radio: number;
  ancho: number;
  angulo: MotionValue<number>;
}) {
  const base = (i * 360) / n;
  // Las cartas que miran de frente brillan; las de los lados se oscurecen (sensación de profundidad)
  const frente = useTransform(angulo, (a) => Math.cos(((base + a) * Math.PI) / 180));
  const filtro = useTransform(frente, (c) => `brightness(${0.35 + Math.max(0, c) * 0.75})`);
  return (
    <Link
      href={`/producto/${p.slug}/`}
      prefetch={false}
      draggable={false}
      className="group absolute inset-x-0 top-0 block"
      style={{ transform: `rotateY(${base}deg) translateZ(${radio}px)`, backfaceVisibility: "hidden" }}
    >
      <motion.div
        style={{ filter: filtro }}
        className="borde-oro overflow-hidden rounded-[22px] bg-carbon shadow-[0_30px_60px_-30px_rgba(0,0,0,.9)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(p.mini)}
          alt={p.nombre}
          draggable={false}
          loading="lazy"
          className="aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ width: ancho }}
        />
        <div className="space-y-1 px-3.5 py-3">
          <p className="line-clamp-1 font-display text-lg leading-tight text-marfil">{p.nombre}</p>
          <p className="text-sm font-bold text-oro-300">{precio(p.precio)}</p>
        </div>
      </motion.div>
    </Link>
  );
}
