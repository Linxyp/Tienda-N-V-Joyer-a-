import type { ReactNode } from "react";
import { cn } from "@/lib/utilidades";
import { Revelar } from "./Revelar";

export function TituloSeccion({
  ceja,
  titulo,
  texto,
  oscuro = false,
  centrado = false,
  accion,
}: {
  ceja: string;
  titulo: ReactNode;
  texto?: ReactNode;
  oscuro?: boolean;
  centrado?: boolean;
  accion?: ReactNode;
}) {
  return (
    <Revelar
      className={cn(
        "mb-10 flex flex-col gap-4 sm:mb-14",
        centrado ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between",
      )}
    >
      <div className={cn("max-w-2xl", centrado && "mx-auto")}>
        <p className={cn("ceja flex items-center gap-3", oscuro ? "text-oro-300" : "text-oro-700", centrado && "justify-center")}>
          <span className="h-px w-8 bg-current opacity-60" />
          {ceja}
          {centrado && <span className="h-px w-8 bg-current opacity-60" />}
        </p>
        <h2
          className={cn(
            "mt-4 font-display text-4xl leading-[1.02] font-medium sm:text-5xl lg:text-6xl",
            oscuro ? "text-marfil" : "text-tinta",
          )}
        >
          {titulo}
        </h2>
        {texto && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", oscuro ? "text-niebla" : "text-piedra")}>{texto}</p>}
      </div>
      {accion}
    </Revelar>
  );
}
