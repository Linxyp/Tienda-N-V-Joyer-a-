import Link from "next/link";
import { asset, cn } from "@/lib/utilidades";

export function Logo({ claro = true, className }: { claro?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-oro-400/50 bg-onix/40 shadow-[0_0_24px_-6px_rgba(220,180,85,.6)] transition-transform duration-700 group-hover:rotate-[360deg] sm:size-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("marca/monograma.png")} alt="" width={162} height={198} className="h-7 w-auto sm:h-8" />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-[1.08rem] font-semibold tracking-[0.12em] whitespace-nowrap min-[400px]:text-[1.2rem] sm:text-2xl sm:tracking-[0.18em]",
            claro ? "text-oro-200" : "text-tinta",
          )}
        >
          N&amp;V <span className="texto-oro">JOYERÍA</span>
        </span>
        <span
          className={cn(
            "mt-1 block text-[0.5rem] font-semibold tracking-[0.3em] whitespace-nowrap uppercase sm:text-[0.58rem] sm:tracking-[0.42em]",
            claro ? "text-niebla" : "text-piedra",
          )}
        >
          Elegancia y estilo
        </span>
      </span>
    </Link>
  );
}
