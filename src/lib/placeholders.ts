/**
 * Imágenes locales de golf para noticias (y otros listados) sin foto propia.
 * Excluye `feg image (5).webp`.
 */

const GOLF_IMAGES = [
  "/feg%20image%20(1).webp",
  "/feg%20image%20(2).webp",
  "/feg%20image%20(3).webp",
  "/feg%20image%20(4).webp",
  "/feg%20image%20(6).webp",
] as const;

export type GolfImageSize = "thumb" | "small" | "regular" | "large";

/**
 * Obtiene URL de placeholder de golf por índice.
 * @param index Índice (0-based) para variar las imágenes
 * @param _size Conservado por compatibilidad; Next.js Image ajusta el tamaño.
 */
export function getGolfPlaceholder(
  index: number = 0,
  _size: GolfImageSize = "regular"
): string {
  return GOLF_IMAGES[Math.abs(index) % GOLF_IMAGES.length];
}
