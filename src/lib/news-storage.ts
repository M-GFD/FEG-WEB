import { getSupabaseAdmin } from "./supabase";

export const NEWS_IMAGES_BUCKET =
  process.env.SUPABASE_NEWS_BUCKET?.trim() || "news-images";

/** Bucket público para MP4/WebM (tope 80 MB). Distinto de news-images (solo fotos, 5 MB). */
export const NEWS_VIDEOS_BUCKET =
  process.env.SUPABASE_NEWS_VIDEOS_BUCKET?.trim() || "news-videos";

const NEWS_IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

/** 80 MB — mismo tope que los videos de reglamento; la subida va directo a Storage. */
export const NEWS_VIDEO_MAX_BYTES = 80 * 1024 * 1024;

export const NEWS_VIDEO_MIME = new Set(["video/mp4", "video/webm"]);

function extFromMime(mime: string): "png" | "jpg" | "webp" | null {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return null;
}

export async function uploadNewsImage(
  file: File,
  userId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "La imagen no puede superar 5 MB" };
  }
  if (!NEWS_IMAGE_MIME.has(file.type)) {
    return { ok: false, error: "Formato no permitido (PNG, JPG, WebP)" };
  }
  const ext = extFromMime(file.type);
  if (!ext) {
    return { ok: false, error: "Formato de imagen no reconocido" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from(NEWS_IMAGES_BUCKET)
    .upload(path, buf, { contentType: file.type, upsert: false });

  if (upErr) {
    return {
      ok: false,
      error: upErr.message.includes("Bucket not found")
        ? `Creá el bucket "${NEWS_IMAGES_BUCKET}" en Supabase Storage`
        : upErr.message,
    };
  }

  const { data } = supabase.storage.from(NEWS_IMAGES_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

function videoExtFromMime(mime: string): "mp4" | "webm" | null {
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";
  return null;
}

export function validateNewsVideoFile(
  mimeType: string,
  fileSize: number
): { ok: true; ext: "mp4" | "webm" } | { ok: false; error: string } {
  if (fileSize > NEWS_VIDEO_MAX_BYTES) {
    return { ok: false, error: "El video no puede superar 80 MB" };
  }
  if (!NEWS_VIDEO_MIME.has(mimeType)) {
    return { ok: false, error: "Formato no permitido (MP4 o WebM)" };
  }
  const ext = videoExtFromMime(mimeType);
  if (!ext) {
    return { ok: false, error: "Formato de video no reconocido" };
  }
  return { ok: true, ext };
}

export type NewsVideoSignedUpload = {
  bucket: string;
  path: string;
  token: string;
  signedUploadUrl: string;
  publicUrl: string;
  mimeType: string;
};

/**
 * URL firmada para subir MP4/WebM directo a Storage (evita el límite de body en Vercel).
 */
export async function createNewsVideoSignedUpload(
  userId: string,
  mimeType: string,
  fileSize: number
): Promise<{ ok: true; upload: NewsVideoSignedUpload } | { ok: false; error: string }> {
  const validated = validateNewsVideoFile(mimeType, fileSize);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const path = `${userId}/${crypto.randomUUID()}.${validated.ext}`;
  const { data, error } = await supabase.storage
    .from(NEWS_VIDEOS_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return {
      ok: false,
      error: error?.message.includes("Bucket not found")
        ? `Creá el bucket público "${NEWS_VIDEOS_BUCKET}" en Supabase Storage`
        : error?.message ?? "No se pudo preparar la subida",
    };
  }

  const { data: pub } = supabase.storage.from(NEWS_VIDEOS_BUCKET).getPublicUrl(path);
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return { ok: false, error: "NEXT_PUBLIC_SUPABASE_URL no configurada" };
  }

  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const signedUploadUrl = `${baseUrl}/storage/v1/object/upload/sign/${NEWS_VIDEOS_BUCKET}/${encodedPath}`;

  return {
    ok: true,
    upload: {
      bucket: NEWS_VIDEOS_BUCKET,
      path: data.path,
      token: data.token,
      signedUploadUrl,
      publicUrl: pub.publicUrl,
      mimeType,
    },
  };
}
