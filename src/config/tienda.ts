// Datos del negocio. Cambia aquí el número, los textos de confianza o las redes y se actualiza toda la web.

export const TIENDA = {
  nombre: "N&V Joyería",
  eslogan: "Elegancia y Estilo",
  descripcion:
    "Joyería en oro laminado 18K: topos, candongas, cadenas, pulseras, anillos y dijes con garantía de hasta 5 años. Pide por WhatsApp y paga con Nequi, Daviplata o Llave Bre-B.",
  ciudad: "Bogotá",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://nyvjoyeria.lux-ia.com",

  /** WhatsApp con indicativo de Colombia, sin + ni espacios */
  whatsapp: "573132602527",
  whatsappVisible: "313 260 2527",

  garantia: "Hasta 5 años de garantía por cambio de tonalidad",
  envios: "Envíos a toda Colombia",
  material: "Oro laminado 18K",
} as const;

export type MetodoPagoId = "nequi" | "daviplata" | "llave";

export interface MetodoPago {
  id: MetodoPagoId;
  nombre: string;
  /** Número o llave al que el cliente transfiere */
  numero: string;
  numeroVisible: string;
  instrucciones: string;
  /** Colores de la tarjeta (identidad de cada billetera) */
  color: string;
  colorTexto: string;
}

// Las tres billeteras usan el mismo número (también es el WhatsApp del negocio).
export const METODOS_PAGO: MetodoPago[] = [
  {
    id: "nequi",
    nombre: "Nequi",
    numero: "3132602527",
    numeroVisible: "313 260 2527",
    instrucciones: "En tu app Nequi elige “Envía plata”, escribe el número y el valor de tu pedido.",
    color: "#2d0a41",
    colorTexto: "#ff3fa4",
  },
  {
    id: "daviplata",
    nombre: "Daviplata",
    numero: "3132602527",
    numeroVisible: "313 260 2527",
    instrucciones: "En tu app Daviplata elige “Pasar plata” a otro Daviplata, escribe el número y el valor.",
    color: "#3d0a0d",
    colorTexto: "#ff4b55",
  },
  {
    id: "llave",
    nombre: "Llave Bre-B",
    numero: "3132602527",
    numeroVisible: "313 260 2527",
    instrucciones:
      "Desde la app de tu banco o billetera entra a Bre-B, elige “Enviar con llave” y usa el número de celular como llave.",
    color: "#06263a",
    colorTexto: "#3fd0ff",
  },
];

export const metodoPorId = (id: MetodoPagoId) => METODOS_PAGO.find((m) => m.id === id)!;
