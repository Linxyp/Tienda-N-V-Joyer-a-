"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OpcionesElegidas } from "@/lib/tipos";

export interface ItemCarrito {
  /** id + opciones: el mismo producto en otro color es otra línea */
  clave: string;
  id: string;
  slug: string;
  sku: string;
  nombre: string;
  precio: number;
  foto: string;
  opciones?: OpcionesElegidas;
  cantidad: number;
}

export interface PedidoEnviado {
  numero: string;
  fecha: string;
  total: number;
  pago: string;
  mensaje: string;
}

interface EstadoCarrito {
  items: ItemCarrito[];
  abierto: boolean;
  ultimoPedido: PedidoEnviado | null;
  agregar: (item: Omit<ItemCarrito, "clave" | "cantidad">, cantidad?: number) => void;
  cambiarCantidad: (clave: string, cantidad: number) => void;
  quitar: (clave: string) => void;
  vaciar: () => void;
  abrir: () => void;
  cerrar: () => void;
  registrarPedido: (p: PedidoEnviado) => void;
}

export const claveItem = (id: string, o?: OpcionesElegidas) =>
  [id, o?.color, o?.talla, o?.letra?.toUpperCase()].filter(Boolean).join("|");

export const MAX_CANTIDAD = 20;

export const useCarrito = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      abierto: false,
      ultimoPedido: null,
      agregar: (item, cantidad = 1) =>
        set((s) => {
          const clave = claveItem(item.id, item.opciones);
          const existe = s.items.find((i) => i.clave === clave);
          const items = existe
            ? s.items.map((i) =>
                i.clave === clave ? { ...i, cantidad: Math.min(MAX_CANTIDAD, i.cantidad + cantidad) } : i,
              )
            : [...s.items, { ...item, clave, cantidad: Math.min(MAX_CANTIDAD, cantidad) }];
          return { items };
        }),
      cambiarCantidad: (clave, cantidad) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.clave === clave ? { ...i, cantidad: Math.max(1, Math.min(MAX_CANTIDAD, cantidad)) } : i,
          ),
        })),
      quitar: (clave) => set((s) => ({ items: s.items.filter((i) => i.clave !== clave) })),
      vaciar: () => set({ items: [] }),
      abrir: () => set({ abierto: true }),
      cerrar: () => set({ abierto: false }),
      registrarPedido: (p) => set({ ultimoPedido: p }),
    }),
    {
      name: "nv-carrito",
      version: 1,
      // Se rehidrata en <Proveedores> después de montar, para no romper la hidratación del HTML estático
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, ultimoPedido: s.ultimoPedido }),
    },
  ),
);

export const totalCarrito = (items: ItemCarrito[]) => items.reduce((s, i) => s + i.precio * i.cantidad, 0);
export const unidadesCarrito = (items: ItemCarrito[]) => items.reduce((s, i) => s + i.cantidad, 0);
