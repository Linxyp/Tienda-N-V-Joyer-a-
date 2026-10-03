import type { Metadata } from "next";
import { Checkout } from "@/components/pedido/Checkout";

export const metadata: Metadata = {
  title: "Finalizar pedido",
  description: "Revisa tus joyas, escribe tus datos de envío y envía tu pedido por WhatsApp.",
  robots: { index: false },
};

export default function PaginaPedido() {
  return (
    <div className="bg-marfil">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-10 lg:px-8 lg:pt-14">
        <div className="mb-10">
          <p className="ceja text-oro-700">Último paso</p>
          <h1 className="mt-3 font-display text-5xl leading-none font-medium text-tinta sm:text-6xl">
            Finaliza tu <em className="texto-oro">pedido</em>
          </h1>
        </div>
        <Checkout />
      </div>
    </div>
  );
}
