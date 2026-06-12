/** Audiencia del contenido editorial y torneos en la web pública. */
export type ContentAudience = "GENERAL" | "MENORES" | "MAYORES";

export type AudienceSegment = "menores" | "mayores";

export const CONTENT_AUDIENCE_VALUES: ContentAudience[] = [
  "GENERAL",
  "MENORES",
  "MAYORES",
];

/** Claves i18n bajo el namespace `audience`. */
export const CONTENT_AUDIENCE_I18N_KEYS: Record<ContentAudience, string> = {
  GENERAL: "general",
  MENORES: "minors",
  MAYORES: "majors",
};

export const AUDIENCE_SEGMENT_I18N_KEYS: Record<AudienceSegment, string> = {
  menores: "segmentMinors",
  mayores: "segmentMayores",
};

export function getContentAudienceLabel(
  t: (key: string) => string,
  audience: ContentAudience
): string {
  return t(CONTENT_AUDIENCE_I18N_KEYS[audience]);
}

export function getAudienceSegmentLabel(
  t: (key: string) => string,
  segment: AudienceSegment
): string {
  return t(AUDIENCE_SEGMENT_I18N_KEYS[segment]);
}

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
