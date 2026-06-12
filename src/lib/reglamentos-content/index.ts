import type { ReglamentoContentSection, ReglamentoSlug } from "./types";
import junior from "./junior-2026.json";
import mayores from "./mayores-2026.json";
import preJuveniles from "./pre-juveniles-2026.json";

const BY_SLUG: Record<ReglamentoSlug, ReglamentoContentSection[]> = {
  junior: junior as ReglamentoContentSection[],
  mayores: mayores as ReglamentoContentSection[],
  "pre-juveniles": preJuveniles as ReglamentoContentSection[],
};

export function getReglamentoContent(slug: ReglamentoSlug): ReglamentoContentSection[] {
  return BY_SLUG[slug] ?? [];
}

export type { ReglamentoBlock, ReglamentoContentSection } from "./types";
