"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { useCarrito } from "@/store/carrito";

export function Proveedores({ children }: { children: ReactNode }) {
  useEffect(() => {
    // El carrito vive en el navegador: se carga después de hidratar el HTML estático
    useCarrito.persist.rehydrate();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.1, smoothWheel: true, anchors: { offset: -90 } }}>
      {children}
      <Toaster
        position="bottom-center"
        offset={88}
        toastOptions={{
          classNames: {
            toast: "!rounded-2xl !border !border-oro-400/30 !bg-noche !text-marfil !shadow-2xl",
            description: "!text-niebla",
            actionButton: "!bg-oro-300 !text-onix !font-bold !rounded-full",
            icon: "!text-oro-300",
          },
        }}
      />
    </ReactLenis>
  );
}
