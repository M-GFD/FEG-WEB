/**
 * Bucket de Supabase Storage para fotos enviadas por clubes (pendientes de prensa).
 * Crear en Dashboard: Storage → New bucket → nombre = valor de env → Public (lectura pública).
 */
export const CLUB_PHOTOS_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || "club-photos";

/** Tamaño máximo por archivo (5 MB). */
export const CLUB_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** Cantidad máxima de imágenes por envío (archivos locales). */
export const CLUB_PHOTO_MAX_COUNT = 15;

export const CLUB_PHOTO_ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
]);

export function extensionFromMime(mime: string): "png" | "jpg" | null {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  return null;
}
