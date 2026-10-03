"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { TIENDA } from "@/config/tienda";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { IconoWhatsApp } from "./IconoWhatsApp";

export function WhatsAppFlotante() {
  const ruta = usePathname();
  // En la ficha del producto y en el checkout ya hay botones de WhatsApp (y la barra de compra en celular)
  if (ruta.startsWith("/pedido") || ruta.startsWith("/producto")) return null;
  return (
    <motion.a
      href={enlaceWhatsApp(`Hola ${TIENDA.nombre}, quiero más información sobre sus joyas.`)}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, rotate: -40 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
      className="group fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-whatsapp p-3 text-white sm:p-3.5 shadow-[0_14px_34px_-10px_rgba(37,211,102,.75)] animate-latido sm:bottom-7 sm:right-7"
      aria-label="Escríbenos por WhatsApp"
    >
      <IconoWhatsApp className="size-6 sm:size-7" />
      <span className="max-w-0 overflow-hidden text-sm font-bold whitespace-nowrap transition-all duration-500 group-hover:max-w-40 group-hover:pr-2">
        ¿Te ayudamos?
      </span>
    </motion.a>
  );
}
