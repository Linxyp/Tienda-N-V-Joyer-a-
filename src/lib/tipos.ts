import type { CategoriaId } from "@/config/categorias";

export interface Foto {
  /** Ruta relativa a /public (sin barra inicial) */
  src: string;
  /** Miniatura 4:5 para tarjetas */
  mini?: string;
}

export interface Producto {
  id: string;
  sku: string;
  slug: string;
  nombre: string;
  categoria: CategoriaId;
  sub?: string;
  etiquetas: string[];
  precio: number;
  colores?: string[];
  tallas?: string[];
  /** Requiere indicar una inicial (o un número de iniciales, p. ej. 2 para pulseras de pareja) */
  letra?: boolean | number;
  premium?: boolean;
  nuevo?: boolean;
  caracteristicas: string[];
  descripcion: string;
  fotos: Foto[];
  origen: "nv" | "proveedor" | "artesanal";
  /** Posición en el orden "Destacados" */
  orden: number;
}

/** Versión compacta para el buscador y el catálogo filtrable (catalogo.json). */
export interface ProductoResumen {
  id: string;
  sku: string;
  slug: string;
  nombre: string;
  categoria: CategoriaId;
  sub?: string;
  etiquetas: string[];
  precio: number;
  mini: string;
  mini2?: string;
  premium?: boolean;
  nuevo?: boolean;
  /** Tiene colores, tallas o letra que el cliente debe elegir */
  opciones?: boolean;
  orden: number;
}

export interface OpcionesElegidas {
  color?: string;
  talla?: string;
  letra?: string;
}
