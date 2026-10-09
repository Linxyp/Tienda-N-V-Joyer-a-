// Píxel de Meta (anuncios de Facebook/Instagram): mide visitas, productos vistos y pedidos para
// optimizar la pauta. El ID es público (va en el HTML de cualquier sitio con píxel); se cambia en
// src/config/tienda.ts → pixelMeta.
import { TIENDA } from "@/config/tienda";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: unknown;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let iniciado = false;

/** Código oficial de Meta, cargado una sola vez y sin bloquear la página (el script llega en paralelo). */
function iniciarPixel() {
  if (iniciado || typeof window === "undefined" || !TIENDA.pixelMeta) return;
  iniciado = true;
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq ??= fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  window.fbq!("init", TIENDA.pixelMeta);
}

/**
 * Evento estándar de Meta (PageView, ViewContent, AddToCart, InitiateCheckout, Lead, Contact…).
 * `idEvento` sirve para no contarlo doble si algún día se suma la API de conversiones.
 */
export function evento(nombre: string, datos?: Record<string, unknown>, idEvento?: string) {
  if (typeof window === "undefined") return;
  iniciarPixel();
  window.fbq?.("track", nombre, datos ?? {}, idEvento ? { eventID: idEvento } : undefined);
}

/** Datos de producto en el formato que espera Meta (la referencia NV-… es el id del producto). */
export const datosProducto = (p: { sku: string; nombre: string; precio: number }, cantidad = 1) => ({
  content_ids: [p.sku],
  content_name: p.nombre,
  content_type: "product",
  contents: [{ id: p.sku, quantity: cantidad }],
  value: p.precio * cantidad,
  currency: "COP",
});
