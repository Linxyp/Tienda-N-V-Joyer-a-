import { metodoPorId, TIENDA, type MetodoPagoId } from "@/config/tienda";
import type { OpcionesElegidas } from "./tipos";
import { precio } from "./utilidades";

export interface LineaPedido {
  nombre: string;
  sku: string;
  precio: number;
  cantidad: number;
  opciones?: OpcionesElegidas;
  url?: string;
}

export interface DatosCliente {
  nombre: string;
  celular: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  barrio?: string;
  notas?: string;
}

export const enlaceWhatsApp = (texto: string) =>
  `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(texto)}`;

export function textoOpciones(o?: OpcionesElegidas) {
  if (!o) return "";
  return [o.color && `Color: ${o.color}`, o.talla && `Talla: ${o.talla}`, o.letra && `Letra: ${o.letra}`]
    .filter(Boolean)
    .join(" · ");
}

/** Número de pedido corto y legible: NV-1003-4821 (mes-día + 4 dígitos). */
export function numeroPedido(fecha = new Date()) {
  const md = `${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}`;
  const azar = Math.floor(1000 + Math.random() * 9000);
  return `NV-${md}-${azar}`;
}

/** Mensaje del pedido completo que el cliente envía al WhatsApp de la tienda. */
export function mensajePedido(p: {
  numero: string;
  lineas: LineaPedido[];
  cliente: DatosCliente;
  pago: MetodoPagoId;
}) {
  const total = p.lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const metodo = metodoPorId(p.pago);
  const productos = p.lineas.map((l, i) => {
    const op = textoOpciones(l.opciones);
    return [
      `${i + 1}. *${l.nombre}*`,
      `   Ref. ${l.sku}${op ? ` · ${op}` : ""}`,
      `   ${l.cantidad} x ${precio(l.precio)} = ${precio(l.precio * l.cantidad)}`,
    ].join("\n");
  });
  const c = p.cliente;
  return [
    `Hola ${TIENDA.nombre}, quiero hacer este pedido:`,
    "",
    `*PEDIDO ${p.numero}*`,
    "",
    ...productos,
    "",
    `*Total productos: ${precio(total)}*`,
    "Envío: por confirmar según la ciudad",
    "",
    "*Datos de envío*",
    `Nombre: ${c.nombre}`,
    `Celular: ${c.celular}`,
    `Ciudad: ${c.ciudad}, ${c.departamento}`,
    `Dirección: ${c.direccion}${c.barrio ? ` (barrio ${c.barrio})` : ""}`,
    ...(c.notas ? [`Notas: ${c.notas}`] : []),
    "",
    `*Pago:* ${metodo.nombre} al ${metodo.numeroVisible}`,
    "Les envío el comprobante por este chat. ¡Gracias!",
  ].join("\n");
}

/** Mensaje rápido para preguntar o pedir un solo producto. */
export function mensajeProducto(l: LineaPedido) {
  const op = textoOpciones(l.opciones);
  return [
    `Hola ${TIENDA.nombre}, me interesa esta joya:`,
    "",
    `*${l.nombre}*`,
    `Ref. ${l.sku}${op ? ` · ${op}` : ""}`,
    `Precio: ${precio(l.precio)}${l.cantidad > 1 ? ` · Cantidad: ${l.cantidad}` : ""}`,
    ...(l.url ? ["", l.url] : []),
    "",
    "¿Está disponible?",
  ].join("\n");
}
