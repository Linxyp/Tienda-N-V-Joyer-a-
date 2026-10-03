import Link from "next/link";
import { ArrowRight, Gem, Send, Wallet } from "lucide-react";
import { TIENDA } from "@/config/tienda";
import { IconoWhatsApp } from "../IconoWhatsApp";
import { TarjetasPago } from "../MetodosPago";
import { Revelar } from "../Revelar";
import { TituloSeccion } from "../TituloSeccion";

const PASOS = [
  {
    icono: Gem,
    titulo: "Elige tus joyas",
    texto: "Explora la colección, escoge color o talla cuando aplique y agrégalas a tu pedido.",
  },
  {
    icono: Send,
    titulo: "Envía tu pedido",
    texto: "Llena tus datos de envío y con un clic llega tu pedido completo a nuestro WhatsApp.",
  },
  {
    icono: Wallet,
    titulo: "Paga y recibe",
    texto: "Confirmamos disponibilidad y envío, pagas por Nequi, Daviplata o Llave y te despachamos.",
  },
];

export function ComoComprar() {
  return (
    <section id="como-comprar" className="grano relative overflow-hidden bg-onix py-20 text-marfil sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-oro-400/60 to-transparent" />
      <div className="pointer-events-none absolute -left-32 top-1/3 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(201,155,60,.16),transparent_65%)]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <TituloSeccion
          oscuro
          centrado
          ceja="Comprar es muy fácil"
          titulo={
            <>
              Tres pasos y tu joya <em className="texto-oro">va en camino</em>
            </>
          }
          texto={`Sin registros ni pasarelas complicadas: tu pedido llega directo a nuestro WhatsApp ${TIENDA.whatsappVisible}.`}
        />

        <div className="relative">
        <div className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-oro-500/0 via-oro-400/60 to-oro-500/0 md:block" />
        <ol className="relative grid gap-5 md:grid-cols-3">
          {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
            <Revelar como="li" key={titulo} retraso={i * 0.12} className="relative">
              <div className="borde-oro h-full rounded-3xl bg-carbon/70 p-7 text-center backdrop-blur">
                <div className="relative mx-auto grid size-24 place-items-center">
                  <span className="absolute inset-0 animate-girar-lento rounded-full border border-dashed border-oro-400/40" />
                  <span className="fondo-oro grid size-16 place-items-center rounded-full text-onix shadow-[0_0_40px_-8px_rgba(220,180,85,.7)]">
                    <Icono className="size-7" strokeWidth={1.6} />
                  </span>
                  <span className="absolute -right-1 -top-1 grid size-8 place-items-center rounded-full bg-onix text-sm font-bold text-oro-200 ring-1 ring-oro-400/50">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-3xl">{titulo}</h3>
                <p className="mt-3 text-sm leading-relaxed text-niebla">{texto}</p>
              </div>
            </Revelar>
          ))}
        </ol>
        </div>

        <div id="pagos" className="mt-20 scroll-mt-28">
          <Revelar className="mb-8 flex flex-col items-center gap-3 text-center">
            <p className="ceja text-oro-300">Métodos de pago</p>
            <h3 className="font-display text-3xl sm:text-4xl">
              Un solo número para pagar y para escribirnos
            </h3>
            <p className="max-w-xl text-sm text-niebla">
              Transfiere desde tu app favorita al <strong className="text-oro-200">{TIENDA.whatsappVisible}</strong> y envíanos el comprobante por WhatsApp.
              Te confirmamos de inmediato.
            </p>
          </Revelar>
          <TarjetasPago />
          <Revelar className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/tienda/" className="btn-oro">
              Empezar a elegir <ArrowRight className="size-4" />
            </Link>
            <a
              href={`https://wa.me/${TIENDA.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-contorno"
            >
              <IconoWhatsApp className="size-4" /> Hablar con nosotros
            </a>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
