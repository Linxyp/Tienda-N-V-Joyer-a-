"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { METODOS_PAGO, type MetodoPago } from "@/config/tienda";
import { cn } from "@/lib/utilidades";
import { Inclinacion3D } from "./Inclinacion3D";

export async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Navegadores sin permiso de portapapeles
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function BotonCopiar({ texto, etiqueta = "Copiar", className }: { texto: string; etiqueta?: string; className?: string }) {
  const [hecho, setHecho] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copiar(texto)) {
          setHecho(true);
          toast.success("Número copiado", { description: texto });
          setTimeout(() => setHecho(false), 1800);
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
        className,
      )}
    >
      {hecho ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {hecho ? "Copiado" : etiqueta}
    </button>
  );
}

/** Logotipo tipográfico de cada billetera (sin usar imágenes de marca). */
export function MarcaPago({ m, className }: { m: MetodoPago; className?: string }) {
  return (
    <span className={cn("font-extrabold tracking-tight", className)} style={{ color: m.colorTexto }}>
      {m.id === "llave" ? (
        <>
          <span className="text-white/90">Llave</span> Bre-B
        </>
      ) : (
        m.nombre
      )}
    </span>
  );
}

export function TarjetasPago() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {METODOS_PAGO.map((m) => (
        <Inclinacion3D key={m.id} className="rounded-3xl" grados={9}>
          <div
            className="relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,.85)] ring-1 ring-white/10"
            style={{ background: `radial-gradient(120% 120% at 0% 0%, ${m.colorTexto}33, transparent 55%), ${m.color}` }}
          >
            <div className="absolute -right-10 -top-10 size-40 rounded-full opacity-25 blur-2xl" style={{ background: m.colorTexto }} />
            <div className="relative flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
              <MarcaPago m={m} className="text-2xl" />
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.18em] uppercase text-white/80">
                Inmediato
              </span>
            </div>
            <p className="relative mt-8 text-xs tracking-[0.2em] text-white/60 uppercase">Envía tu pago al</p>
            <p className="relative mt-1 font-mono text-[1.65rem] font-bold tracking-wider">{m.numeroVisible}</p>
            <p className="relative mt-3 min-h-16 text-sm leading-snug text-white/70">{m.instrucciones}</p>
            <BotonCopiar texto={m.numero} etiqueta="Copiar número" className="relative mt-4 bg-white/10 text-white hover:bg-white/20" />
          </div>
        </Inclinacion3D>
      ))}
    </div>
  );
}
