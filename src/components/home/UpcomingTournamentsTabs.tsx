"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getUpcomingFegDates } from "@/lib/calendario-feg";

const PLACEHOLDER_IMAGES = [
  "/feg%20image%20(1).jpg",
  "/feg%20image%20(2).jpg",
  "/feg%20image%20(3).jpg",
  "/feg%20image%20(4).jpg",
  "/feg%20image%20(5).jpeg",
  "/feg%20image%20(6).jpg",
];

export function UpcomingTournamentsTabs() {
  // Recalcula al montar (cliente) y cada cambio de día relevante,
  // usando la fecha REAL del navegador.
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 60 * 60); // cada hora
    return () => clearInterval(id);
  }, []);

  const dates = useMemo(() => getUpcomingFegDates(4, now), [now]);
  const [activeIdx, setActiveIdx] = useState(0);
  const selected = dates[activeIdx] ?? dates[0];

  if (dates.length === 0) {
    return (
      <section
        id="proximos-torneos"
        className="scroll-mt-28 bg-[#0b0f0b] lg:scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <h3 className="font-heading text-3xl font-semibold tracking-tight text-white">
            PRÓXIMOS TORNEOS
          </h3>
          <p className="mt-4 text-white/60">
            No hay torneos próximos en este momento.
          </p>
        </div>
      </section>
    );
  }

  const imageUrl =
    PLACEHOLDER_IMAGES[activeIdx % PLACEHOLDER_IMAGES.length];

  return (
    <section
      id="proximos-torneos"
      className="scroll-mt-28 bg-[#0b0f0b] lg:scroll-mt-24"
    >
      <div className="grid gap-0 lg:grid-cols-12 lg:items-stretch">
        {/* Lista lateral — pegada al margen izquierdo */}
        <RevealOnScroll
          revealIndex={0}
          yOffset={18}
          className="bg-[#0b2b12] lg:col-span-4 lg:h-full"
        >
          {/* pl en lg alinea con max-w-7xl + lg:px-8 de Noticias (80rem = max-w-7xl) */}
          <div className="h-full px-6 py-12 text-white lg:pr-8 lg:pl-[calc((100vw-min(100vw,80rem))/2+2rem)]">
            <h3 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              PRÓXIMOS TORNEOS
            </h3>

            <div className="mt-8 space-y-1">
              {dates.map((entry, i) => {
                const active = i === activeIdx;
                return (
                  <button
                    key={`${entry.fecha}-${entry.sede}`}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`w-full rounded-xl px-4 py-4 text-left transition ${
                      active
                        ? "bg-white/12 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
                        : "hover:bg-white/6"
                    }`}
                  >
                    <p
                      className={`font-heading text-lg font-semibold leading-tight ${
                        active ? "text-[#dbf3db]" : "text-white/70"
                      }`}
                    >
                      {entry.fecha}
                    </p>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        active ? "text-white" : "text-white/50"
                      }`}
                    >
                      {entry.sede}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        active
                          ? "bg-[var(--feg-yellow)] text-[#193f2b]"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {entry.modalidad}
                    </span>
                  </button>
                );
              })}
            </div>

            <Link
              href="/calendario"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--feg-yellow)] px-7 py-3 text-sm font-semibold text-[var(--feg-green-2)] transition hover:brightness-95"
            >
              Ver calendario completo →
            </Link>
          </div>
        </RevealOnScroll>

        {/* Imagen + detalle — hasta el margen derecho, misma altura que la lista */}
        <RevealOnScroll
          revealIndex={2}
          yOffset={28}
          className="relative min-h-[400px] lg:col-span-8 lg:h-full lg:min-h-0"
        >
          <div className="relative h-full min-h-[400px] overflow-hidden lg:min-h-0 lg:h-full">
            <Image
              key={activeIdx}
              src={imageUrl}
              alt={`${selected.sede} — ${selected.fecha}`}
              fill
              className="object-cover object-center transition-opacity duration-500"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <span className="inline-flex rounded-full bg-[var(--feg-yellow)] px-4 py-1.5 font-heading text-xs font-semibold text-[#193f2b] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                {selected.modalidad}
              </span>
              <h4 className="mt-3 font-heading text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {selected.sede}
              </h4>
              <p className="mt-2 text-lg font-medium text-white/85">
                {selected.fecha} · {selected.year ?? selected._parsed.getFullYear()}
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
