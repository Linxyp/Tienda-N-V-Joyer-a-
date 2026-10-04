import type { CategoriaId } from "@/config/categorias";
import { hash } from "./utilidades";

// Textos de ficha por categoría. Se elige una variante fija por producto para que no todas digan lo mismo.
// Van redactados en aposición ("Nombre: …") para que concuerden con cualquier nombre (singular/plural).
const PLANTILLAS: Record<CategoriaId, string[]> = {
  topos: [
    "{n}: el detalle que ilumina tu rostro sin esfuerzo. En oro laminado 18K, con un peso ligero y cómodo para llevar de la mañana a la noche.",
    "Pequeño detalle, gran brillo: {n} en oro laminado 18K, para combinar con el look de diario, la oficina o una noche especial.",
    "Delicadeza con un brillo que no pasa desapercibido: {n}, una pieza en oro laminado 18K pensada para usar todos los días.",
  ],
  candongas: [
    "{n}: un clásico renovado en oro laminado 18K que enmarca tu rostro con luz. Ligereza y comodidad para combinar con todo.",
    "La forma perfecta de elevar cualquier look: {n}, con acabado en oro laminado 18K que brilla en cada movimiento.",
    "Elegancia que se nota de lejos: {n}, en oro laminado 18K y con un cierre seguro y cómodo para todo el día.",
  ],
  cadenas: [
    "{n}: caída suave y brillo intenso en oro laminado 18K. Lúcela sola o con tu dije favorito.",
    "Un tejido que habla por sí solo: {n}, en oro laminado 18K con cierre seguro, ideal para el día a día o para regalar.",
    "Pieza esencial de todo joyero: {n} en oro laminado 18K, resistente, cómoda y con un acabado impecable.",
  ],
  pulseras: [
    "{n}: brillo sutil en cada gesto, en oro laminado 18K. Perfecta para usar sola o combinar con otras pulseras.",
    "Delicadeza con carácter: {n}, en oro laminado 18K, cómoda para el día a día y lista para regalar.",
    "Un detalle que se siente especial: {n} en oro laminado 18K, con un acabado que resalta en tu muñeca.",
  ],
  balines: [
    "{n}: tejida a mano, nudo a nudo, con balines en oro laminado 18K que brillan en cada movimiento. Cómoda para todos los días.",
    "Hecha a mano para lucir y regalar: {n}, con balines en oro laminado 18K y un tejido que combina con todo.",
    "Un clásico artesanal que nunca falla: {n}, con balines en oro laminado 18K y terminaciones cuidadas a mano.",
  ],
  tobilleras: [
    "{n}: un destello a cada paso, en oro laminado 18K. Liviana y cómoda, ideal para sandalias y días de sol.",
    "Femenina y versátil: {n}, en oro laminado 18K para acompañarte en tus mejores planes.",
  ],
  anillos: [
    "{n}: un brillo en oro laminado 18K que acompaña tus manos todos los días. Elegancia fácil de combinar.",
    "La pieza que se vuelve tu favorita: {n}, con acabado en oro laminado 18K que realza cualquier look.",
  ],
  dijes: [
    "{n}: un símbolo pequeño con mucho significado, en oro laminado 18K. Combínalo con tu cadena favorita.",
    "Lleva contigo lo que te representa: {n}, en oro laminado 18K, con detalles finos y un brillo duradero.",
    "Un detalle con historia: {n} en oro laminado 18K, perfecto para personalizar tu cadena o para regalar.",
  ],
  conjuntos: [
    "{n}: una combinación en oro laminado 18K pensada para lucir en armonía. Lista para regalar.",
    "Todo combina a la perfección: {n} en oro laminado 18K, un regalo que siempre acierta.",
  ],
  rosarios: [
    "{n}: fe que se lleva con elegancia, en oro laminado 18K. Una pieza con significado, ideal para regalar.",
    "Devoción y estilo en una sola pieza: {n}, en oro laminado 18K y con detalles cuidadosamente terminados.",
  ],
};

const RELIGIOSOS = " Un símbolo de fe para llevar siempre cerca del corazón.";

export function describir(p: { id: string; nombre: string; categoria: CategoriaId; sub?: string; descripcion?: string }) {
  if (p.descripcion) return p.descripcion;
  const variantes = PLANTILLAS[p.categoria];
  let texto = variantes[hash(p.id) % variantes.length].replace("{n}", p.nombre);
  if (p.sub === "religiosos" || p.sub === "cruces") texto += RELIGIOSOS;
  return texto;
}

export const CUIDADOS_BALINES =
  "Para que los balines conserven su brillo, quítatela para bañarte, nadar o hacer ejercicio, evita perfumes y cremas, y guárdala seca en su estuche.";

export const CUIDADOS =
  "Para conservar su brillo por más tiempo, evita el contacto directo con perfumes, cremas, cloro y agua salada, y guárdala seca en su estuche.";
