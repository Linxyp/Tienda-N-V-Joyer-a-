"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { Toaster } from "sonner";
import { useCarrito } from "@/store/carrito";

// Desplazamiento suave solo con mouse/trackpad: en celulares el scroll nativo ya es fluido
// y así no queda un ciclo de animación corriendo en cada cuadro.
const CONSULTA = "(hover: hover) and (pointer: fine)";
const suscribir = (aviso: () => void) => {
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener("change", aviso);
  return () => mq.removeEventListener("change", aviso);
};

export function Proveedores({ children }: { children: ReactNode }) {
  const conMouse = useSyncExternalStore(suscribir, () => window.matchMedia(CONSULTA).matches, () => false);

  useEffect(() => {
    // El carrito vive en el navegador: se carga después de hidratar el HTML estático
    useCarrito.persist.rehydrate();
  }, []);

  return (
    <>
      {/* En modo "root" Lenis controla el scroll de la página sin envolver el contenido */}
      {conMouse && <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, anchors: { offset: -90 } }} />}
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
    </>
  );
}
