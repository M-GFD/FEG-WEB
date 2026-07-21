"use client";

import { DiaTextReveal } from "@/components/ui/dia-text-reveal";

/** Paleta FEG para la banda del reveal; el color final del texto es siempre blanco. */
const HERO_REVEAL_COLORS = [
  "#f3e12b",
  "#5cb85c",
  "#ffffff",
  "#146638",
  "#f3e12b",
];

const HERO_TEXT_WHITE = "#ffffff";

const LINE_CLASS =
  "block whitespace-nowrap text-center text-[clamp(calc(1.81rem+4pt),calc(8vw+4pt),calc(2.71rem+4pt))] max-[380px]:text-[calc(1.75rem+4pt)]";

type Props = {
  line1: string;
  line2: string;
  line3: string;
  titleDesktop: string;
  titleDesktop2: string;
  subtitle: string;
};

/**
 * Titular + subtítulo del Hero con Dia Text Reveal (Magic UI).
 */
export function HeroHeadline({
  line1,
  line2,
  line3,
  titleDesktop,
  titleDesktop2,
  subtitle,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="font-heading font-semibold leading-[1.08] text-center text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.45),0_1px_4px_rgba(0,0,0,0.55)] max-md:px-0 max-md:tracking-tight sm:leading-[1.06] md:text-balance md:text-[56px] md:leading-[1.05]">
        <span className="inline-flex flex-col items-center uppercase md:hidden">
          <DiaTextReveal
            text={line1}
            textColor={HERO_TEXT_WHITE}
            colors={HERO_REVEAL_COLORS}
            startOnView={false}
            delay={0}
            duration={1.6}
            className={LINE_CLASS}
          />
          <DiaTextReveal
            text={line2}
            textColor={HERO_TEXT_WHITE}
            colors={HERO_REVEAL_COLORS}
            startOnView={false}
            delay={0.15}
            duration={1.6}
            className={LINE_CLASS}
          />
          <DiaTextReveal
            text={line3}
            textColor={HERO_TEXT_WHITE}
            colors={HERO_REVEAL_COLORS}
            startOnView={false}
            delay={0.3}
            duration={1.6}
            className={LINE_CLASS}
          />
        </span>
        <span className="hidden uppercase md:inline md:text-[56px]">
          <DiaTextReveal
            text={titleDesktop}
            textColor={HERO_TEXT_WHITE}
            colors={HERO_REVEAL_COLORS}
            startOnView={false}
            delay={0}
            duration={1.7}
            className="md:text-[56px]"
          />
          <br />
          <DiaTextReveal
            text={titleDesktop2}
            textColor={HERO_TEXT_WHITE}
            colors={HERO_REVEAL_COLORS}
            startOnView={false}
            delay={0.22}
            duration={1.7}
            className="md:text-[56px]"
          />
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[0.95rem] font-medium leading-relaxed text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.42)] sm:text-base sm:leading-normal md:text-lg">
        <DiaTextReveal
          text={subtitle}
          textColor={HERO_TEXT_WHITE}
          colors={HERO_REVEAL_COLORS}
          startOnView={false}
          delay={0.45}
          duration={1.8}
          className="text-[0.95rem] font-medium leading-relaxed sm:text-base sm:leading-normal md:text-lg"
        />
      </p>
    </div>
  );
}
