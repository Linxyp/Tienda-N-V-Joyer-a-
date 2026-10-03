"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Monta su contenido solo cuando el bloque se acerca a la pantalla (útil para escenas 3D pesadas). */
export function CuandoCerca({
  children,
  className,
  margen = "500px",
  mientras,
}: {
  children: ReactNode;
  className?: string;
  margen?: string;
  mientras?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cerca, setCerca] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setCerca(true);
          io.disconnect();
        }
      },
      { rootMargin: margen },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margen]);
  return (
    <div ref={ref} className={className}>
      {cerca ? children : mientras}
    </div>
  );
}
