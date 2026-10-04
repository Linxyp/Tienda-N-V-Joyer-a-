import { Gem } from "lucide-react";

const FRASES = [
  "Oro laminado 18K",
  "Garantía hasta 5 años",
  "Envíos a toda Colombia",
  "Paga con Nequi",
  "Daviplata",
  "Llave Bre-B",
  "Asesoría por WhatsApp",
  "Línea Premium italiana",
  "Pulseras en balines",
];

export function Marquesina() {
  const fila = [...FRASES, ...FRASES];
  return (
    <div className="relative overflow-hidden border-y border-oro-500/25 bg-noche py-5" aria-hidden>
      <div className="flex w-max animate-marquesina items-center gap-10 whitespace-nowrap">
        {fila.map((f, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl tracking-wide text-oro-200/90 italic sm:text-3xl">
            {f}
            <Gem className="size-4 text-oro-400" strokeWidth={1.4} />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-noche to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-noche to-transparent" />
    </div>
  );
}
