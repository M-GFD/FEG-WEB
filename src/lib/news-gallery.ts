/** URLs de galería al pie (columna JSON en News). */
export function parseNewsGalleryUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (u): u is string =>
      typeof u === "string" && (u.startsWith("https://") || u.startsWith("http://"))
  );
}
