import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...c: ClassValue[]) => twMerge(clsx(c));

const COP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

/** $ 140.000 (con espacio que no se parte entre el signo y el valor) */
const ESPACIO_FIJO = String.fromCharCode(160);
export const precio = (n: number) => COP.format(n).replace(/\s/g, ESPACIO_FIJO);

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Ruta pública de un archivo de /public respetando el basePath (GitHub Pages). */
export const asset = (ruta: string) => `${BASE_PATH}/${ruta.replace(/^\//, "")}`;

/** Quita tildes y diéresis (descompone en NFD y elimina las marcas combinantes). */
export const sinTildes = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "");

/** Texto normalizado para búsquedas: minúsculas, sin tildes ni signos. */
export const normalizar = (s: string) =>
  sinTildes(s.toLowerCase())
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Hash numérico estable (para elegir variantes de texto de forma determinista). */
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
