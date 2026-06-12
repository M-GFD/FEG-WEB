import type { AppLocale } from "@/i18n/routing";
import type { ReglamentoContentSection, ReglamentoSlug } from "./types";
import juniorEs from "./junior-2026.json";
import juniorEn from "./junior-2026.en.json";
import juniorPt from "./junior-2026.pt.json";
import mayoresEs from "./mayores-2026.json";
import mayoresEn from "./mayores-2026.en.json";
import mayoresPt from "./mayores-2026.pt.json";
import preJuvenilesEs from "./pre-juveniles-2026.json";
import preJuvenilesEn from "./pre-juveniles-2026.en.json";
import preJuvenilesPt from "./pre-juveniles-2026.pt.json";

const BY_SLUG_LOCALE: Record<
  ReglamentoSlug,
  Partial<Record<AppLocale, ReglamentoContentSection[]>> & { es: ReglamentoContentSection[] }
> = {
  junior: { es: juniorEs as ReglamentoContentSection[], en: juniorEn as ReglamentoContentSection[], pt: juniorPt as ReglamentoContentSection[] },
  mayores: { es: mayoresEs as ReglamentoContentSection[], en: mayoresEn as ReglamentoContentSection[], pt: mayoresPt as ReglamentoContentSection[] },
  "pre-juveniles": {
    es: preJuvenilesEs as ReglamentoContentSection[],
    en: preJuvenilesEn as ReglamentoContentSection[],
    pt: preJuvenilesPt as ReglamentoContentSection[],
  },
};

export function getReglamentoContent(
  slug: ReglamentoSlug,
  locale: AppLocale = "es"
): ReglamentoContentSection[] {
  const pack = BY_SLUG_LOCALE[slug];
  return pack[locale] ?? pack.es;
}

export type { ReglamentoBlock, ReglamentoContentSection } from "./types";
