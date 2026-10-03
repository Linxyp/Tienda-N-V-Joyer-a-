import Link from "next/link";
import { MapPin, ShieldCheck, Truck } from "lucide-react";
import { CATEGORIAS } from "@/config/categorias";
import { METODOS_PAGO, TIENDA } from "@/config/tienda";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { IconoWhatsApp } from "./IconoWhatsApp";
import { Logo } from "./Logo";

export function Pie() {
  const anio = new Date().getFullYear();
  return (
    <footer className="grano relative overflow-hidden bg-onix text-niebla">
      <div className="h-px bg-gradient-to-r from-transparent via-oro-400/70 to-transparent" />
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,155,60,.12),transparent_65%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed">
            Boutique virtual de joyería en oro laminado 18K con sede en {TIENDA.ciudad}. Piezas elegantes, precios justos y
            atención personalizada por WhatsApp.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-oro-400" /> {TIENDA.garantia}
            </li>
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-oro-400" /> {TIENDA.envios}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-oro-400" /> {TIENDA.ciudad}, Colombia
            </li>
          </ul>
        </div>

        <div>
          <p className="ceja mb-5 text-oro-300">Colección</p>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIAS.map((c) => (
              <li key={c.id}>
                <Link href={`/tienda/${c.id}/`} className="transition-colors hover:text-oro-200">
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="ceja mb-5 text-oro-300">Ayuda</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/#como-comprar" className="transition-colors hover:text-oro-200">
                Cómo comprar
              </Link>
            </li>
            <li>
              <Link href="/#pagos" className="transition-colors hover:text-oro-200">
                Métodos de pago
              </Link>
            </li>
            <li>
              <Link href="/#preguntas" className="transition-colors hover:text-oro-200">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link href="/pedido/" className="transition-colors hover:text-oro-200">
                Mi pedido
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-5">
          <p className="ceja text-oro-300">Pide por WhatsApp</p>
          <a
            href={enlaceWhatsApp(`Hola ${TIENDA.nombre}, quiero hacer una consulta.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full sm:w-auto"
          >
            <IconoWhatsApp className="size-5" /> {TIENDA.whatsappVisible}
          </a>
          <div>
            <p className="mb-3 text-xs tracking-[0.18em] uppercase">Pagos aceptados</p>
            <div className="flex flex-wrap gap-2">
              {METODOS_PAGO.map((m) => (
                <span
                  key={m.id}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold ring-1 ring-white/10"
                  style={{ background: m.color, color: m.colorTexto }}
                >
                  {m.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs sm:flex-row lg:px-8">
          <p>
            © {anio} {TIENDA.nombre}. Todos los derechos reservados.
          </p>
          <p className="tracking-[0.2em] uppercase">Oro laminado 18K · Hecho para brillar</p>
        </div>
      </div>
    </footer>
  );
}
