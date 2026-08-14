import type { Area } from "react-easy-crop";

/** Relación de la portada en la noticia publicada (`aspect-video`). */
export const NEWS_COVER_ASPECT = 16 / 9;

const MAX_OUTPUT_WIDTH = 1920;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("No se pudo cargar la imagen")));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

/**
 * Recorta la imagen según el área de `react-easy-crop` (helper oficial de la librería,
 * vía canvas del navegador).
 */
export async function cropCoverImage(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo recortar la imagen");
  }

  const scale = pixelCrop.width > MAX_OUTPUT_WIDTH ? MAX_OUTPUT_WIDTH / pixelCrop.width : 1;
  canvas.width = Math.round(pixelCrop.width * scale);
  canvas.height = Math.round(pixelCrop.height * scale);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });
  if (!blob) {
    throw new Error("No se pudo generar la portada recortada");
  }
  return blob;
}
