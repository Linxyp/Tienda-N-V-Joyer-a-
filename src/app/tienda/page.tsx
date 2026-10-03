import type { Metadata } from "next";
import { CabeceraTienda } from "@/components/catalogo/CabeceraTienda";
import { Catalogo } from "@/components/catalogo/Catalogo";
import { productos, resumen } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Tienda · Toda la colección",
  description:
    "Toda la colección de N&V Joyería en oro laminado 18K: topos, candongas, cadenas, pulseras, dijes, anillos y más. Pide por WhatsApp.",
  alternates: { canonical: "tienda/" },
};

export default function Tienda() {
  const lista = productos();
  const iniciales = lista.slice(0, 24).map(resumen);
  return (
    <>
      <CabeceraTienda
        titulo="La colección"
        lema={`Más de ${Math.floor(lista.length / 100) * 100} diseños para cada momento: desde topos delicados hasta cadenas italianas de presencia.`}
        total={lista.length}
        desde={Math.min(...lista.map((p) => p.precio))}
        fotos={lista.filter((p) => p.premium && p.fotos[0].mini).slice(0, 3).map((p) => p.fotos[0].mini!)}
        migas={[{ href: "/", texto: "Inicio" }, { texto: "Tienda" }]}
      />
      <div className="bg-marfil pt-8">
        <Catalogo iniciales={iniciales} total={lista.length} />
      </div>
    </>
  );
}
