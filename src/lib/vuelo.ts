"use client";

// Pequeño bus de eventos para la animación "la joya vuela al carrito".
export interface DetalleVuelo {
  src: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

export const EVENTO_VUELO = "nv:vuelo";
export const EVENTO_ATERRIZAJE = "nv:aterrizaje";

export function volarAlCarrito(origen: Element | null, src: string) {
  if (typeof window === "undefined") return;
  const r = origen?.getBoundingClientRect();
  const detalle: DetalleVuelo = r
    ? { src, x: r.left, y: r.top, ancho: r.width, alto: r.height }
    : { src, x: window.innerWidth / 2 - 60, y: window.innerHeight / 2 - 75, ancho: 120, alto: 150 };
  window.dispatchEvent(new CustomEvent<DetalleVuelo>(EVENTO_VUELO, { detail: detalle }));
}
