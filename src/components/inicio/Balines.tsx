import Link from "next/link";
import { ArrowRight, Hand, Ruler, Sparkles } from "lucide-react";
import type { ProductoResumen } from "@/lib/tipos";
import { Revelar } from "../Revelar";
import { TarjetaProducto } from "../TarjetaProducto";
import { TituloSeccion } from "../TituloSeccion";

const SELLOS = [
  { icono: Hand, texto: "Tejidas a mano" },
  { icono: Ruler, texto: "Ajustables a tu muñeca" },
  { icono: Sparkles, texto: "Balines que brillan" },
];

/** Sección destacada: las pulseras en balines más vendidas. */
export function Balines({ productos }: { productos: ProductoResumen[] }) {
  if (productos.length < 4) return null;
  return (
    <section id="balines" className="relative overflow-hidden bg-perla py-20 sm:py-28">
      <div className="pointer-events-none absolute -right-32 top-0 size-[32rem] rounded-full bg-[radial-gradient(circle,rgba(201,155,60,.16),transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <TituloSeccion
          ceja="Nueva sección · Hecho a mano"
          titulo={
            <>
              Pulseras <em className="texto-oro">en balines</em>
            </>
          }
          texto="Las más pedidas: tejidas a mano, ajustables y listas para combinar o regalar."
          accion={
            <Link href="/tienda/balines/" className="btn-oro self-start lg:self-auto">
              Ver todas <ArrowRight className="size-4" />
            </Link>
          }
        />
        <Revelar className="-mt-4 mb-10 flex flex-wrap gap-3">
          {SELLOS.map(({ icono: Icono, texto }) => (
            <span
              key={texto}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-tinta ring-1 ring-arena"
            >
              <Icono className="size-4 text-oro-600" /> {texto}
            </span>
          ))}
        </Revelar>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {productos.slice(0, 8).map((p, i) => (
            <Revelar key={p.id} retraso={(i % 4) * 0.07}>
              <TarjetaProducto p={p} />
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}
