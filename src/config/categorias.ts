export type CategoriaId =
  | "topos"
  | "candongas"
  | "cadenas"
  | "pulseras"
  | "dijes"
  | "anillos"
  | "tobilleras"
  | "conjuntos"
  | "rosarios";

export interface Subcategoria {
  id: string;
  nombre: string;
}

export interface Categoria {
  id: CategoriaId;
  nombre: string;
  /** Nombre en singular para textos ("1 topo", "Agregaste un dije…") */
  singular: string;
  lema: string;
  subs?: Subcategoria[];
}

export const CATEGORIAS: Categoria[] = [
  {
    id: "topos",
    nombre: "Topos",
    singular: "topos",
    lema: "Brillo delicado para todos los días",
    subs: [
      { id: "rosca", nombre: "Rosca de seguridad" },
      { id: "piercing", nombre: "Piercing" },
    ],
  },
  { id: "candongas", nombre: "Candongas", singular: "candonga", lema: "El clásico que nunca falla" },
  {
    id: "cadenas",
    nombre: "Cadenas",
    singular: "cadena",
    lema: "Tejidos italianos que enamoran",
    subs: [
      { id: "40", nombre: "40 cm" },
      { id: "45", nombre: "45 cm" },
      { id: "50-60", nombre: "50 y 60 cm" },
      { id: "65", nombre: "65 cm" },
    ],
  },
  { id: "pulseras", nombre: "Pulseras", singular: "pulsera", lema: "Para lucir en cada gesto" },
  {
    id: "dijes",
    nombre: "Dijes",
    singular: "dije",
    lema: "Pequeños símbolos, grandes historias",
    subs: [
      { id: "religiosos", nombre: "Religiosos" },
      { id: "cruces", nombre: "Cruces" },
      { id: "moda", nombre: "De moda" },
    ],
  },
  { id: "anillos", nombre: "Anillos", singular: "anillo", lema: "Promesas que brillan" },
  { id: "tobilleras", nombre: "Tobilleras", singular: "tobillera", lema: "Un destello a cada paso" },
  { id: "conjuntos", nombre: "Conjuntos", singular: "conjunto", lema: "Combinaciones listas para regalar" },
  {
    id: "rosarios",
    nombre: "Rosarios y denarios",
    singular: "rosario",
    lema: "Fe que se lleva con elegancia",
    subs: [
      { id: "rosarios", nombre: "Rosarios" },
      { id: "denarios", nombre: "Denarios" },
    ],
  },
];

export const categoriaPorId = (id: string) => CATEGORIAS.find((c) => c.id === id);

export const nombreSub = (cat: string, sub?: string) =>
  sub ? categoriaPorId(cat)?.subs?.find((s) => s.id === sub)?.nombre : undefined;
