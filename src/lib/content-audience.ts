/** Audiencia del contenido editorial y torneos en la web pública. */
export type ContentAudience = "GENERAL" | "MENORES" | "MAYORES";

export type AudienceSegment = "menores" | "mayores";

export const CONTENT_AUDIENCE_VALUES: ContentAudience[] = [
  "GENERAL",
  "MENORES",
  "MAYORES",
];

export const CONTENT_AUDIENCE_LABELS: Record<ContentAudience, string> = {
  GENERAL: "General (todo el sitio)",
  MENORES: "Menores (juveniles / pre-juveniles / junior)",
  MAYORES: "Mayores (senior / damas)",
};

export const AUDIENCE_SEGMENT_LABELS: Record<AudienceSegment, string> = {
  menores: "Menores",
  mayores: "Mayores",
};

const QUERY_KEY = "audiencia";

/** Parsea `?audiencia=menores|mayores` (case-insensitive). */
export function parseAudienceSegment(
  value: string | string[] | undefined | null
): AudienceSegment | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (v === "menores" || v === "mayores") return v;
  return null;
}

export function audienceQueryHref(
  basePath: string,
  segment: AudienceSegment
): string {
  const sep = basePath.includes("?") ? "&" : "?";
  return `${basePath}${sep}${QUERY_KEY}=${segment}`;
}

export function contentAudienceFromForm(value: string | null): ContentAudience {
  const v = String(value ?? "")
    .trim()
    .toUpperCase();
  if (v === "MENORES" || v === "MAYORES" || v === "GENERAL") return v;
  return "GENERAL";
}

/** Noticias/torneos visibles en el listado filtrado por segmento. */
export function matchesAudienceFilter(
  audience: ContentAudience | string | null | undefined,
  segment: AudienceSegment
): boolean {
  const a = String(audience ?? "GENERAL").toUpperCase() as ContentAudience;
  if (a === "GENERAL") return true;
  return a === segment.toUpperCase();
}
