/**
 * Placeholder images de golf sin copyright.
 * Fuentes: Unsplash (Unsplash License - uso libre).
 * URLs directas para uso como placeholders.
 */

const GOLF_IMAGES = [
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b",
  "https://images.unsplash.com/photo-1593111774240-d529f12c0c0",
  "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
  "https://images.unsplash.com/photo-1591491711272-7a0a3e1a2f5e",
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b",
  "https://images.unsplash.com/photo-1593111774240-d529f12c0c0",
  "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa",
] as const;

export type GolfImageSize = "thumb" | "small" | "regular" | "large";

const SIZE_PARAMS: Record<GolfImageSize, string> = {
  thumb: "w=200&q=80",
  small: "w=400&q=80",
  regular: "w=800&q=80",
  large: "w=1200&q=80",
};

/**
 * Obtiene URL de placeholder de golf por índice.
 * @param index Índice (0-based) para variar las imágenes
 * @param size Tamaño deseado
 */
export function getGolfPlaceholder(
  index: number = 0,
  size: GolfImageSize = "regular"
): string {
  const base = GOLF_IMAGES[index % GOLF_IMAGES.length];
  const params = SIZE_PARAMS[size];
  const separator = base.includes("?") ? "&" : "?";
  return `${base}?${params}`;
}
