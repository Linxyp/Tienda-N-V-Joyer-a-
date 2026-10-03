import Link from "next/link";
import { ArrowRight, BadgeCheck, Gift, HandHeart, ShieldCheck } from "lucide-react";
import { Carrusel3D } from "@/components/inicio/Carrusel3D";
import { Categorias } from "@/components/inicio/Categorias";
import { ComoComprar } from "@/components/inicio/ComoComprar";
import { Hero } from "@/components/inicio/Hero";
import { Marquesina } from "@/components/inicio/Marquesina";
import { Preguntas } from "@/components/inicio/Preguntas";
import { Premium } from "@/components/inicio/Premium";
import { IconoWhatsApp } from "@/components/IconoWhatsApp";
import { Revelar } from "@/components/Revelar";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { TituloSeccion } from "@/components/TituloSeccion";
import { TIENDA } from "@/config/tienda";
import { productos, resumen, resumenCategorias } from "@/lib/catalogo";
import type { ProductoResumen } from "@/lib/tipos";
import { enlaceWhatsApp } from "@/lib/whatsapp";

/** Toma n productos variando la categoría (evita 5 topos seguidos). */
function variados(lista: ProductoResumen[], n: number) {
  const usados = new Map<string, number>();
  const out: ProductoResumen[] = [];
  for (const p of lista) {
    const k = usados.get(p.categoria) ?? 0;
    if (k >= Math.ceil(n / 4)) continue;
    usados.set(p.categoria, k + 1);
    out.push(p);
    if (out.length === n) break;
  }
  return out;
}

export default function Inicio() {
  const todos = productos().map(resumen);
  const conDosFotos = todos.filter((p) => p.mini2);
  const carrusel = variados(conDosFotos, 12);
  const nuevos = todos.filter((p) => p.nuevo);
  const usados = new Set([...carrusel, ...nuevos.slice(0, 4)].map((p) => p.id));
  const favoritos = variados(todos.filter((p) => !usados.has(p.id)), 8);
  const premium = todos.filter((p) => p.premium);
  const paraEl = variados(
    todos.filter((p) => p.etiquetas.includes("hombre") || (p.categoria === "cadenas" && p.sub === "65")),
    8,
  );

  return (
    <>
      <Hero totalProductos={todos.length} />
      <Marquesina />
      <Categorias categorias={resumenCategorias()} />

      {/* Carrusel 3D */}
      <section className="grano relative overflow-hidden bg-onix py-20 text-marfil sm:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[30rem] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(201,155,60,.18),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <TituloSeccion
            oscuro
            centrado
            ceja="Lo más deseado"
            titulo={
              <>
                Piezas que <em className="texto-oro">enamoran</em>
              </>
            }
            texto="Desliza para girar la vitrina y toca la joya que te guste."
          />
        </div>
        <Carrusel3D productos={carrusel} />
      </section>

      {/* Favoritos */}
      <section className="bg-marfil py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <TituloSeccion
            ceja={nuevos.length ? "Recién llegados y favoritos" : "Favoritos de la casa"}
            titulo={
              <>
                Elige, agrega y <em className="texto-oro">brilla</em>
              </>
            }
            texto="Agrega tus joyas al pedido con un toque. Cuando termines, lo envías a nuestro WhatsApp."
            accion={
              <Link href="/tienda/" className="btn-oro self-start lg:self-auto">
                Ver toda la colección <ArrowRight className="size-4" />
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {[...nuevos.filter((p) => !carrusel.includes(p)).slice(0, 4), ...favoritos].slice(0, 8).map((p, i) => (
              <Revelar key={p.id} retraso={(i % 4) * 0.07}>
                <TarjetaProducto p={p} />
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      <Premium productos={variados(premium.filter((p) => p.mini2), 3)} total={premium.length} />

      {/* Para él */}
      {paraEl.length >= 4 && (
        <section className="bg-marfil py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <TituloSeccion
              ceja="Para él"
              titulo={
                <>
                  Estilo con <em className="texto-oro">carácter</em>
                </>
              }
              texto="Cadenas largas, topos sobrios y piezas con presencia, pensadas para él."
              accion={
                <Link href="/tienda/?para=hombre" className="btn-contorno !border-oro-600/50 !text-oro-700 hover:!bg-oro-100 self-start lg:self-auto">
                  Ver todo para él <ArrowRight className="size-4" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {paraEl.map((p, i) => (
                <Revelar key={p.id} retraso={(i % 4) * 0.07}>
                  <TarjetaProducto p={p} />
                </Revelar>
              ))}
            </div>
          </div>
        </section>
      )}

      <ComoComprar />

      {/* Promesa */}
      <section className="border-b border-arena bg-marfil py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 lg:grid-cols-4 lg:px-8">
          {[
            { i: ShieldCheck, t: "Garantía real", d: "Hasta 5 años por cambio de tonalidad." },
            { i: BadgeCheck, t: "Oro laminado 18K", d: "Piezas seleccionadas con acabado premium." },
            { i: Gift, t: "Listas para regalar", d: "Empacadas con cuidado para ese momento especial." },
            { i: HandHeart, t: "Atención cercana", d: "Te asesoramos por WhatsApp antes y después." },
          ].map(({ i: I, t, d }, n) => (
            <Revelar key={t} retraso={n * 0.08} className="flex flex-col items-center gap-3 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-white text-oro-600 shadow-[0_10px_30px_-12px_rgba(150,105,30,.5)] ring-1 ring-arena">
                <I className="size-6" strokeWidth={1.5} />
              </span>
              <span className="font-display text-xl text-tinta">{t}</span>
              <span className="max-w-[16rem] text-sm text-piedra">{d}</span>
            </Revelar>
          ))}
        </div>
      </section>

      <Preguntas />

      {/* Llamado final */}
      <section className="grano relative overflow-hidden bg-onix py-20 text-center text-marfil sm:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,155,60,.25),transparent_65%)]" />
        <Revelar className="relative mx-auto max-w-3xl px-5">
          <p className="ceja text-oro-300">{TIENDA.nombre}</p>
          <h2 className="mt-5 font-display text-4xl leading-tight sm:text-6xl">
            Tu próxima joya favorita <em className="texto-oro">te está esperando</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-niebla">
            ¿Tienes dudas sobre una pieza, una talla o un regalo? Escríbenos y te ayudamos a elegir.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/tienda/" className="btn-oro">
              Explorar la colección <ArrowRight className="size-4" />
            </Link>
            <a
              href={enlaceWhatsApp(`Hola ${TIENDA.nombre}, quiero asesoría para elegir una joya.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <IconoWhatsApp className="size-5" /> {TIENDA.whatsappVisible}
            </a>
          </div>
        </Revelar>
      </section>
    </>
  );
}
