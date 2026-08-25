import { prepareNewsVideoUpload } from "./actions";

/** Mismos topes que el servidor; no importar news-storage (service role) en el cliente. */
const NEWS_VIDEO_MAX_BYTES = 80 * 1024 * 1024;

async function uploadToSignedUrl(
  signedUploadUrl: string,
  token: string,
  file: File,
  mimeType: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = new URL(signedUploadUrl);
  url.searchParams.set("token", token);

  const res = await fetch(url.toString(), {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": mimeType,
      "x-upsert": "false",
    },
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200);
    return { ok: false, error: detail || `Error al subir (${res.status})` };
  }
  return { ok: true };
}

export function resolveNewsVideoMime(file: File): "video/mp4" | "video/webm" | null {
  if (file.type === "video/mp4" || file.type === "video/webm") return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".mp4")) return "video/mp4";
  return null;
}

export function isNewsVideoFile(file: File): boolean {
  return resolveNewsVideoMime(file) !== null;
}

export function isNewsImageFile(file: File): boolean {
  if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp") {
    return true;
  }
  return /\.(png|jpe?g|webp)$/i.test(file.name);
}

export async function uploadNewsVideoFile(file: File): Promise<string> {
  const mimeType = resolveNewsVideoMime(file);
  if (!mimeType) {
    throw new Error("Formato no permitido (MP4 o WebM)");
  }
  if (file.size > NEWS_VIDEO_MAX_BYTES) {
    throw new Error("El video no puede superar 80 MB");
  }

  const toUpload =
    file.type === mimeType ? file : new File([file], file.name, { type: mimeType });

  const prep = await prepareNewsVideoUpload({
    mimeType,
    fileSize: toUpload.size,
  });
  if (!prep.ok) {
    throw new Error(prep.error ?? "No se pudo preparar la subida");
  }

  const uploaded = await uploadToSignedUrl(
    prep.upload.signedUploadUrl,
    prep.upload.token,
    toUpload,
    prep.upload.mimeType
  );
  if (!uploaded.ok) {
    throw new Error(uploaded.error);
  }

  return prep.upload.publicUrl;
}
