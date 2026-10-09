"use client";

import { toast } from "sonner";
import { datosProducto, evento } from "@/lib/pixel";
import { textoOpciones } from "@/lib/whatsapp";
import type { OpcionesElegidas } from "@/lib/tipos";
import { asset } from "@/lib/utilidades";
import { volarAlCarrito } from "@/lib/vuelo";
import { useCarrito } from "@/store/carrito";

export interface DatosAgregar {
  id: string;
  slug: string;
  sku: string;
  nombre: string;
  precio: number;
  foto: string;
}

/** Agrega al pedido con animación de vuelo y aviso. */
export function useAgregar() {
  const agregar = useCarrito((s) => s.agregar);
  const abrir = useCarrito((s) => s.abrir);
  return (p: DatosAgregar, opts?: { opciones?: OpcionesElegidas; cantidad?: number; origen?: Element | null }) => {
    agregar({ ...p, opciones: opts?.opciones }, opts?.cantidad ?? 1);
    evento("AddToCart", datosProducto(p, opts?.cantidad ?? 1));
    volarAlCarrito(opts?.origen ?? null, asset(p.foto));
    const op = textoOpciones(opts?.opciones);
    toast.success("Agregado a tu pedido", {
      description: `${p.nombre}${op ? ` · ${op}` : ""}`,
      action: { label: "Ver pedido", onClick: abrir },
    });
  };
}
