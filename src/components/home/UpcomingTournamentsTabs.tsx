"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import {
  formatFechaTitle,
  getUpcomingFegDates,
  type CalendarEntryWithDate,
} from "@/lib/calendario-feg";

const PLACEHOLDER_IMAGES = [
  "/feg%20image%20(1).webp",
  "/feg%20image%20(2).webp",
  "/feg%20image%20(3).webp",
  "/feg%20image%20(4).webp",
  "/feg%20image%20(5).webp",
  "/feg%20image%20(6).webp",
];

type TournamentCardProps = {
  entry: CalendarEntryWithDate;
  index: number;
  revealIndex: number;
  isActive: boolean;
  onActivate: (index: number) => void;
};

function UpcomingTournamentCard({
  entry,
  index,
  revealIndex,
  isActive,
  onActivate,
}: TournamentCardProps) {
  return (
    <RevealOnScroll revealIndex={revealIndex} yOffset={20} className="min-w-0">
      <article
        onMouseEnter={() => onActivate(index)}
        onClick={() => onActivate(index)}
        onFocus={() => onActivate(index)}
        tabIndex={0}
        className={`relative w-full rounded-2xl bg-white/14 shadow-[0_20px_60px_rgba(0,36,3,0.18)] backdrop-blur-sm transition-[box-shadow,background-color] duration-300 outline-none ${
          isActive ? "bg-white/20 ring-1 ring-white/25" : "ring-1 ring-white/10"
        }`}
      >
        <div className="p-5">
          <p className="min-w-0 text-xl font-semibold leading-snug">
            <span className="text-white">{entry.sede}</span>
            <span className="text-white/75"> – </span>
            <span className="font-bold text-[var(--feg-yellow)]">
              {formatFechaTitle(entry.fecha)}
            </span>
          </p>

          <div className="mt-3 inline-flex w-fit rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
            {entry.modalidad}
          </div>
        </div>
      </article>
    </RevealOnScroll>
  );
}

export function UpcomingTournamentsTabs() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 60 * 60);
    return () => clearInterval(id);
  }, []);

  const dates = useMemo(() => getUpcomingFegDates(4, now), [now]);

  if (dates.length === 0) {
    return (
      <section
        id="proximos-torneos"
        className="scroll-mt-28 bg-[var(--feg-bg)] lg:scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <h3 className="font-heading text-3xl font-semibold tracking-tight text-[var(--feg-ink)]">
            PRÓXIMOS TORNEOS
          </h3>
          <p className="mt-4 text-[var(--feg-green)]">
            No hay torneos próximos en este momento.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="proximos-torneos"
      data-header-theme="dark"
      className="relative scroll-mt-28 overflow-hidden lg:scroll-mt-24"
      onMouseLeave={() => setActiveImageIdx(0)}
    >
      <div className="absolute inset-0 bg-[var(--feg-bg)]">
        {PLACEHOLDER_IMAGES.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            aria-hidden
            className={`object-cover object-center transition-opacity duration-700 ease-out ${
              activeImageIdx === i ? "opacity-100" : "opacity-0"
            }`}
            sizes="100vw"
          />
        ))}
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <RevealOnScroll revealIndex={0} yOffset={18} className="mx-auto max-w-3xl text-center">
          <h3 className="font-heading text-[28px] font-semibold leading-[1.1] text-white [text-shadow:0_2px_12px_rgba(0,36,3,0.55)] sm:text-[36px]">
            PRÓXIMOS TORNEOS
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium text-white/85 [text-shadow:0_2px_10px_rgba(0,36,3,0.4)] sm:text-lg">
            Fechas, sedes y modalidades del circuito federado.
          </p>
        </RevealOnScroll>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {dates.map((entry, i) => (
            <UpcomingTournamentCard
              key={`${entry.fecha}-${entry.sede}-${entry.modalidad}`}
              entry={entry}
              index={i}
              revealIndex={i + 1}
              isActive={activeImageIdx === i}
              onActivate={setActiveImageIdx}
            />
          ))}
        </div>

        <RevealOnScroll revealIndex={5} yOffset={14} className="mt-8 flex justify-center">
          <Link
            href="/calendario"
            className="inline-flex items-center justify-center rounded-full bg-[var(--feg-yellow)] px-8 py-3 text-sm font-semibold text-[var(--feg-green-2)] transition hover:brightness-95"
          >
            Ver calendario completo →
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
