import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CabeceraTienda } from "@/components/catalogo/CabeceraTienda";
import { Catalogo } from "@/components/catalogo/Catalogo";
import { CATEGORIAS, categoriaPorId, type CategoriaId } from "@/config/categorias";
import { productosDeCategoria, resumen } from "@/lib/catalogo";

type Props = { params: Promise<{ categoria: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIAS.filter((c) => productosDeCategoria(c.id).length > 0).map((c) => ({ categoria: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const cat = categoriaPorId(categoria);
  if (!cat) return {};
  const n = productosDeCategoria(cat.id).length;
  // "Pulseras en balines" ya dice de qué están hechas; no repetir "en oro laminado"
  const titulo = cat.id === "balines" ? `${cat.nombre} tejidas a mano` : `${cat.nombre} en oro laminado 18K`;
  return {
    title: titulo,
    description: `${n} diseños de ${titulo.charAt(0).toLowerCase()}${titulo.slice(1)}. ${cat.lema}. Pide por WhatsApp y paga con Nequi, Daviplata o Llave.`,
    alternates: { canonical: `tienda/${cat.id}/` },
  };
}

export default async function PaginaCategoria({ params }: Props) {
  const { categoria } = await params;
  const cat = categoriaPorId(categoria);
  if (!cat) notFound();
  const lista = productosDeCategoria(cat.id as CategoriaId);
  return (
    <>
      <CabeceraTienda
        titulo={cat.nombre}
        lema={cat.lema}
        total={lista.length}
        desde={Math.min(...lista.map((p) => p.precio))}
        fotos={lista.filter((p) => p.fotos[0].mini).slice(0, 3).map((p) => p.fotos[0].mini!)}
        migas={[{ href: "/", texto: "Inicio" }, { href: "/tienda/", texto: "Tienda" }, { texto: cat.nombre }]}
      />
      <div className="bg-marfil pt-8">
        <Catalogo categoria={cat.id} iniciales={lista.slice(0, 24).map(resumen)} total={lista.length} />
      </div>
    </>
  );
}
