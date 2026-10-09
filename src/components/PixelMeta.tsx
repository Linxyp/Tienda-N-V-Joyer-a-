"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { evento } from "@/lib/pixel";

/** Visitas para el píxel de Meta: una por página, también al navegar dentro de la tienda sin recargar. */
export function PixelMeta() {
  const ruta = usePathname();

  useEffect(() => {
    evento("PageView");
  }, [ruta]);

  // Botones de asesoría por WhatsApp (flotante, encabezado, pie…) = Contacto
  useEffect(() => {
    const alHacerClic = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('a[href^="https://wa.me/"]')) evento("Contact");
    };
    document.addEventListener("click", alHacerClic, { capture: true });
    return () => document.removeEventListener("click", alHacerClic, { capture: true });
  }, []);

  return null;
}
