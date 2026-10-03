import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NoEncontrado() {
  return (
    <section className="grano relative grid min-h-[70vh] place-items-center overflow-hidden bg-onix px-5 text-center text-marfil">
      <div className="pointer-events-none absolute size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(201,155,60,.22),transparent_65%)]" />
      <div className="relative">
        <p className="font-display text-[7rem] leading-none sm:text-[10rem]">
          <span className="texto-oro">404</span>
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Esta joya ya no está en la vitrina</h1>
        <p className="mx-auto mt-4 max-w-md text-niebla">Puede que el enlace haya cambiado. Te invitamos a ver toda la colección.</p>
        <Link href="/tienda/" className="btn-oro mt-8">
          Ver la colección <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
