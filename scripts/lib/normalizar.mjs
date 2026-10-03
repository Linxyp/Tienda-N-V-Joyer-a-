// Limpieza y normalización de los datos del proveedor: nombres comerciales, categorías,
// colores/tallas disponibles y características. Todo lo que el cliente final ve sale de aquí.

const ENTIDADES = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü",
  iquest: "¿", iexcl: "¡", deg: "°", times: "×", middot: "·", ndash: "–", mdash: "—",
};

export function htmlATexto(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, e) => {
      if (e[0] === "#") {
        const cp = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
      }
      return ENTIDADES[e] ?? m;
    })
    .replace(/[ \t ]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && l !== "/")
    .join("\n");
}

export const quitarEmojis = (s) =>
  s.replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍⃣〰]/gu, "").replace(/\s+/g, " ").trim();

export const sinTildes = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

export function slugify(s) {
  return sinTildes(s.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

// ---------------------------------------------------------------------------
// Título interno del proveedor (bodega + datos internos + código de fábrica).
// De ahí solo se toman la bodega (para el reporte privado) y el código de fábrica.
export function parsearTitulo(titulo = "") {
  const t = titulo.trim().replace(/\s+/g, " ");
  const b = t.match(/(?:solo|disponible)\s*(?:solo\s*)?(?:en\s*)?(cali|medell[ií]n)/i);
  const bodega = b ? (/cali/i.test(b[1]) ? "Cali" : "Medellín") : null;
  const r = t.match(/ref\.?\s*0*\d+\s*[-_]\s*([a-z0-9-]+?)(?:[-_]\d+)?\s*\)?\s*$/i);
  return { bodega, codigo: r ? r[1].toUpperCase() : null };
}

/** Familia de producto según el código de fábrica (23xxx dijes, 34xxx topos, 4xxxx cadenas…). */
export function categoriaPorCodigo(codigo) {
  if (!codigo || !/^\d{5,6}$/.test(codigo)) return null;
  const d = codigo[0];
  if (codigo.length === 6 && codigo.startsWith("70")) return { categoria: "anillos" };
  return (
    { 2: { categoria: "dijes", sub: "moda" }, 3: { categoria: "topos" }, 4: { categoria: "cadenas" },
      5: { categoria: "pulseras" }, 6: { categoria: "conjuntos" }, 9: { categoria: "rosarios" } }[d] || null
  );
}

// ---------------------------------------------------------------------------
// Categorías de N&V Joyería
export const CATEGORIAS_PROVEEDOR = {
  "PIERCING": { categoria: "topos", sub: "piercing" },
  "Topos": { categoria: "topos" },
  "Topos para hombres": { categoria: "topos", etiquetas: ["hombre"] },
  "Topos Rosca Seguridad": { categoria: "topos", sub: "rosca" },
  "Candongas": { categoria: "candongas" },
  "Cadena de 40cm": { categoria: "cadenas", sub: "40" },
  "Cadenas de 45cm": { categoria: "cadenas", sub: "45" },
  "Cadenas de 60 y 50 cm": { categoria: "cadenas", sub: "50-60" },
  "Cadenas de 65cm": { categoria: "cadenas", sub: "65" },
  "Pulsera": { categoria: "pulseras" },
  "Tobillera": { categoria: "tobilleras" },
  "Anillos": { categoria: "anillos" },
  "Dijes religiosos": { categoria: "dijes", sub: "religiosos" },
  "Dijes no religiosos": { categoria: "dijes", sub: "moda" },
  "Dijes de cruz": { categoria: "dijes", sub: "cruces" },
  "Conjuntos": { categoria: "conjuntos" },
  "Rosarios": { categoria: "rosarios", sub: "rosarios" },
  "Denarios": { categoria: "rosarios", sub: "denarios" },
};

/** Categoría por palabras clave, para productos sin categoría en el proveedor. */
export function categoriaPorNombre(nombre) {
  const n = sinTildes(nombre.toLowerCase());
  const conteoCadenas = (n.match(/cadena/g) || []).length;
  if (conteoCadenas > 1 || /conjunto|\+ ?dije/.test(n)) return { categoria: "conjuntos" };
  if (/candonga/.test(n)) return { categoria: "candongas" };
  if (/tobillera/.test(n)) return { categoria: "tobilleras" };
  if (/pulsera|pulso/.test(n)) return { categoria: "pulseras" };
  if (/cadena/.test(n)) {
    const largo = n.match(/(\d{2})\s*cm/);
    const sub = largo ? ({ 40: "40", 45: "45", 50: "50-60", 60: "50-60", 65: "65" })[largo[1]] : undefined;
    return { categoria: "cadenas", sub };
  }
  if (/anillo|argolla/.test(n)) return { categoria: "anillos" };
  if (/dije|cruz|medalla/.test(n)) return { categoria: "dijes", sub: "moda" };
  if (/topo|arete|areta/.test(n)) return { categoria: "topos" };
  return null;
}

// ---------------------------------------------------------------------------
// Colores, tallas y notas que vienen en la descripción
const COLORES = [
  [/\bcristal(es)?\b|\bblanc[oa]s?\b|\bcrystal\b/, "Cristal"],
  [/\bverdes?\b|\besmerald/, "Verde"],
  [/\bnegr[oa]s?\b/, "Negro"],
  [/\broj[oa]s?\b|\brubi\b/, "Rojo"],
  [/\brosad?[oa]?s?\b/, "Rosa"],
  [/\bazul(es)?\b/, "Azul"],
  [/\bfucsia\b/, "Fucsia"],
  [/\bnaranja\b/, "Naranja"],
  [/\bmorad[oa]\b|\blila\b/, "Morado"],
  [/\bcolores\b|\bmulticolor\b/, "Multicolor"],
];

function coloresEn(texto) {
  const t = sinTildes(texto.toLowerCase());
  return COLORES.filter(([re]) => re.test(t)).map(([, c]) => c);
}

export function parsearDescripcion(texto) {
  const lineas = texto.split("\n").map((l) => l.trim()).filter(Boolean);
  const todo = lineas.join(" / ");
  const bajo = sinTildes(todo.toLowerCase());

  // Primera línea con contenido real = nombre (a veces la primera es "VALOR POR UNIDAD")
  let nombreCrudo = lineas.find((l) => !/^valor por unidad$/i.test(l)) || "";
  // Cortamos lo que venga desde "Disponibilidad" en la misma línea
  nombreCrudo = nombreCrudo.replace(/\s*(disponib|colores disponibles|talla).*$/i, "").trim();

  // Bloque de disponibilidad (todo lo que sigue a la primera mención)
  const iDisp = bajo.search(/disponib|colores disponibles|talla/);
  const bloqueDisp = iDisp >= 0 ? todo.slice(iDisp) : "";
  let colores = bloqueDisp ? coloresEn(bloqueDisp.replace(/medell[ií]n|cali/gi, "")) : [];
  const paren = nombreCrudo.match(/\((naranja|verde|azul|rojo|negro|rosa|cristal)\)/i) || todo.match(/^[^/]*\/\s*\((naranja|verde|azul|rojo|negro|rosa|cristal)\)/i);
  if (paren) colores = [...new Set([...colores, ...coloresEn(paren[1])])];

  let tallas = [];
  if (/talla|tallas/.test(bajo) || /anillo|argolla/.test(sinTildes(nombreCrudo.toLowerCase()))) {
    if (iDisp >= 0) {
      const nums = bloqueDisp.replace(/,(\d)/g, ".$1").match(/\b\d{1,2}(?:\.5)?\b/g) || [];
      tallas = [...new Set(nums.map(Number).filter((n) => n >= 4 && n <= 14))].sort((a, b) => a - b);
    }
  }

  return {
    nombreCrudo,
    colores,
    tallas: tallas.map((n) => String(n).replace(".", ",")),
    premium: /l[ií]?mea premium|linea premium|línea premium/i.test(todo) || /l[ií]nea premium/i.test(texto),
    basePlata: /base (en )?plata/i.test(todo),
    porUnidad: /valor por unidad/i.test(todo),
    cadenaAparte: /cadena (por separado|por apart)/i.test(todo),
    incluyeDos: /vienen los dos/i.test(todo),
    preguntarInicial: /inicial/i.test(todo) && /letra|inicial/i.test(nombreCrudo + " " + todo),
    extensor: /extens|\+ ?ext\b|\bext\b/i.test(todo),
    unisex: /unisex/i.test(todo),
  };
}

// ---------------------------------------------------------------------------
// Nombre comercial
const TILDES = {
  corazon: "corazón", circon: "circón", balin: "balín", avion: "avión", angel: "ángel",
  arcangel: "arcángel", jesus: "Jesús", maria: "María", espiritu: "espíritu", leon: "león",
  buho: "búho", libelula: "libélula", arbol: "árbol", cafe: "café", delfin: "delfín",
  triangulo: "triángulo", oracion: "oración", simbolo: "símbolo", dolar: "dólar",
  dolares: "dólares", futbol: "fútbol", balon: "balón", camara: "cámara",
  fotografica: "fotográfica", atletico: "atlético", paris: "París", tio: "tío",
  trebol: "trébol", treboles: "tréboles", onix: "ónix", cinturon: "cinturón",
  eslabon: "eslabón", cordon: "cordón", pendulo: "péndulo", pequeno: "pequeño",
  pequena: "pequeña", extension: "extensión", clasica: "clásica", clasico: "clásico",
  pave: "pavé", nino: "niño", nina: "niña", senora: "señora", impériale: "impériale",
  magestic: "majestic", brigth: "bright", brightnees: "brightness", quypsy: "gypsy",
  elevaant: "elephant", djje: "dije", inri: "INRI", ichtus: "ICHTUS", mama: "mamá",
  medellin: "Medellín", lumen: "lúmen", padel: "pádel", eclat: "éclat", elite: "élite",
  emera: "émera", imperial: "imperial", unica: "única", unico: "único", sagrado: "sagrado",
  guadalupana: "guadalupana", corazones: "corazones", italia: "Italia", egipcio: "egipcio",
  medalla: "medalla", circonia: "circonia", circonias: "circonias", aguila: "águila",
  rubi: "rubí", ovalo: "óvalo", petalo: "pétalo", estrellas: "estrellas", aurea: "áurea",
};

const SIEMPRE_MAYUS = new Set([
  "CT", "GC", "GCC", "VC", "VSC", "MSK", "MKS", "CTR", "CRN", "INRI", "ICHTUS", "ICE", "2L",
  "3C", "CC", "T", "G", "M", "P", "R", "B", "L", "I", "J", "N", "S", "XL", "TV", "NY", "USA",
]);
const MINUS = new Set(["de", "del", "la", "las", "el", "los", "y", "e", "con", "en", "para", "por", "a", "al", "o", "x", "su"]);

function tituloPalabra(w, i, palabras) {
  if (!w) return w;
  const up = w.toUpperCase();
  if (SIEMPRE_MAYUS.has(up) && /\d/.test(w)) return up; // 2L, 3C
  if (/^\d/.test(w)) return w.toLowerCase(); // 45, 3*1, 11:11, 2,5
  if (/^(mm|cm)$/i.test(w)) return w.toLowerCase();
  if (w === "+" || w === "·" || w === "&" || w === "-") return w;
  const anterior = (palabras[i - 1] || "").toLowerCase();
  if (w.length === 1) {
    if (anterior === "inicial" || anterior === "letra") return up;
    if (i > 0 && MINUS.has(w.toLowerCase())) return w.toLowerCase();
    return up;
  }
  if (SIEMPRE_MAYUS.has(up) && (w === up || up.length <= 3)) return up;
  const lower = w.toLowerCase();
  if (i === 1 && /^(el|la|los|las)$/.test(lower)) return lower[0].toUpperCase() + lower.slice(1);
  if (i > 0 && MINUS.has(lower)) return lower;
  const tilde = TILDES[sinTildes(lower)] ?? lower;
  if (/^[A-ZÁÉÍÓÚÑ]{2,}$/.test(tilde)) return tilde; // INRI, ICHTUS
  return tilde.charAt(0).toUpperCase() + tilde.slice(1);
}

function aTitulo(s) {
  const palabras = s.split(" ").filter(Boolean);
  return palabras.map((w, i) => tituloPalabra(w, i, palabras)).join(" ");
}

function limpiarMedidas(s) {
  return s
    .replace(/(\d)\s+\.(\d)/g, "$1.$2") // "24 .5" → "24.5"
    .replace(/\((?:medida\s*)?([^)]*\d[^)]*)\)/gi, " $1 ") // "(medida 4mm)" → "4mm"
    .replace(/#\s*(\d)/g, "$1")
    .replace(/(\d+(?:[.,]\d+)?)\s*(?:mmm|mm)\b\.?/gi, "$1 mm")
    .replace(/(\d+(?:[.,]\d+)?)\s*(?:cms|cm|ctms)\b\.?/gi, "$1 cm")
    .replace(/(\d)\.(\d)/g, "$1,$2"); // decimales al estilo colombiano
}

/** Quita extensor, línea premium, base de plata, referencias internas, etc. del nombre. */
function quitarRuido(s) {
  return s
    .replace(/\bref\.?:?\s*\d+.*$/i, "") // "Ref: 30059 De $30.000 Para $50.000" / "ref 23036"
    .replace(/\(?\s*l[ií]?[nm]ea premium\s*\)?/gi, "")
    .replace(/\(?\s*base (en )?plata( 925)?( italy)?\s*\)?/gi, "")
    .replace(/\(?\s*vienen los dos\s*\)?/gi, "")
    .replace(/\(?\s*valor (de la cadena )?(por (separado|aparte|apart[eé]))\s*\)?/gi, "")
    .replace(/valor por unidad/gi, "")
    .replace(/(?:\s*(?:\+|\bmás\b|\bmas\b|\bcon\b|\by\b)\s*(?:\d+(?:[.,]\d+)?\s*cm\.?\s*)?(?:de\s+)?|\s+|^)(?:extensor|extensi[oó]n|ext)\b\.?/gi, " ")
    .replace(/\bdisponible\b/gi, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s*[:/.]+\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sinRepetidas(s) {
  const p = s.split(" ");
  return p.filter((w, i) => i === 0 || w.toLowerCase() !== p[i - 1].toLowerCase()).join(" ");
}

function italiana(s, femenino) {
  return s.replace(/\b(it|italy)\b/gi, femenino ? "Italiana" : "Italiano");
}

const LARGO_SUB = { 40: "40 cm", 45: "45 cm", 65: "65 cm" };

export function nombreComercial(crudo, categoria, sub) {
  let s = quitarEmojis(crudo).replace(/[“”"]/g, "").replace(/\s+/g, " ").trim();
  s = s.replace(/^c\s+conjunto\b/i, "Conjunto");
  s = quitarRuido(s);
  s = limpiarMedidas(s);
  s = s.replace(/\bdelg\.?(?=\s|$)/gi, "delgada").replace(/\bdjje\b/gi, "Dije");
  s = s.replace(/^pulso\b/i, "Pulsera");
  // No afirmamos la marca del cristal: "Swarovski" pasa a "Cristal"
  s = s.replace(/\bswarovski\b|\bswaro\b/gi, "Cristal").replace(/\bcristal\s+cristal\b/gi, "Cristal");

  const quitarPrefijo = (re) => {
    let prev;
    do { prev = s; s = s.replace(re, "").trim(); } while (s !== prev);
  };

  switch (categoria) {
    case "topos": {
      if (sub === "piercing") { s = s.replace(/^piercing\s*/i, ""); s = "Piercing " + s; break; }
      quitarPrefijo(/^(aretas?|aretes?|a|topitos?|topos?|l)\s+/i);
      s = s.replace(/\s*(con\s+)?rosca\s+(de\s+)?seguridad\b/gi, "").replace(/^rosca\s+/i, "");
      s = "Topos " + s;
      break;
    }
    case "candongas": {
      quitarPrefijo(/^(aretas?|aretes?|a)\s+/i);
      if (!/candonga/i.test(s)) s = "Aretes " + s;
      break;
    }
    case "cadenas": {
      s = s.replace(/^c\s+/i, "Cadena ");
      if (!/^cadena/i.test(s)) s = "Cadena " + s;
      s = italiana(s, true);
      if (!/\d+\s*cm/i.test(s) && LARGO_SUB[sub]) s += " " + LARGO_SUB[sub];
      break;
    }
    case "pulseras": {
      s = s.replace(/^p\s+/i, "Pulsera ");
      if (!/^(pulsera|set|tobillera)/i.test(s)) s = "Pulsera " + s;
      s = italiana(s, true);
      break;
    }
    case "tobilleras": {
      if (!/^tobillera/i.test(s)) s = "Tobillera " + s;
      s = italiana(s, true);
      break;
    }
    case "anillos": {
      if (!/^(anillo|argolla)/i.test(s)) s = "Anillo " + s;
      break;
    }
    case "dijes": {
      s = s.replace(/^d\s+/i, "Dije ");
      s = s.replace(/^signos zodiacales:?\s*/i, "Signo Zodiacal ");
      if (!/^dije/i.test(s)) s = "Dije " + s;
      break;
    }
    case "conjuntos": {
      if (!/^(conjunto|gargantilla)/i.test(s)) s = "Conjunto " + s;
      break;
    }
    case "rosarios": {
      if (!/^(denario|rosario|pulsera)/i.test(s)) s = (sub === "rosarios" ? "Rosario " : "Denario ") + s;
      break;
    }
  }
  s = s.replace(/\s*:\s*/g, " ").replace(/\s+/g, " ").trim();
  s = sinRepetidas(s);
  if ((s.match(/\bajustable\b/gi) || []).length > 1) s = s.replace(/\s*\bajustable\b/gi, "") + " Ajustable";
  return aTitulo(s);
}

/** Núcleo del nombre para comparar productos (sin prefijos de tipo, sin tildes, sin espacios). */
export function nucleo(nombre) {
  return sinTildes(nombre.toLowerCase())
    .replace(/\b(topos?|aretes?|aretas?|dije|cadena|pulsera|tobillera|anillo|candongas?|conjunto|linea|premium|mini|de|del|la|el|y|con)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

// ---------------------------------------------------------------------------
// Características legibles para la ficha del producto
export function caracteristicas(nombre, info, categoria) {
  const c = ["Oro laminado 18K"];
  const largo = nombre.match(/(\d+(?:,\d+)?) cm/);
  const grosor = nombre.match(/(\d+(?:,\d+)?) mm/);
  if (largo) c.push(`Largo: ${largo[1]} cm`);
  if (grosor) c.push(`${["topos", "candongas", "dijes"].includes(categoria) ? "Tamaño" : "Grosor"}: ${grosor[1]} mm`);
  if (info.extensor) c.push("Incluye extensor para ajustar el largo");
  if (info.basePlata) c.push("Base en plata 925");
  if (/ajustable/i.test(nombre)) c.push("Talla ajustable");
  if (info.porUnidad) c.push("Precio por unidad");
  if (info.cadenaAparte) c.push("La cadena se vende por separado");
  if (info.incluyeDos) c.push("Incluye las dos piezas");
  if (info.unisex) c.push("Diseño unisex");
  return c;
}
