/** URLs de galería al pie (columna JSON en News). */
export function parseNewsGalleryUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (u): u is string =>
      typeof u === "string" && (u.startsWith("https://") || u.startsWith("http://"))
  );
}

export function isNewsVideoUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".mp4") || path.endsWith(".webm");
  } catch {
    const lower = url.toLowerCase();
    return lower.includes(".mp4") || lower.includes(".webm");
  }
}

export function newsVideoMimeFromUrl(url: string): "video/mp4" | "video/webm" {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith(".webm") ? "video/webm" : "video/mp4";
  } catch {
    return url.toLowerCase().includes(".webm") ? "video/webm" : "video/mp4";
  }
}
