import { getSupabaseAdmin } from "./supabase";

export const REGLAMENTO_VIDEOS_BUCKET =
  process.env.SUPABASE_REGLAMENTO_VIDEOS_BUCKET?.trim() || "reglamento-videos";

/** 80 MB — videos cortos explicativos. */
export const REGLAMENTO_VIDEO_MAX_BYTES = 80 * 1024 * 1024;

export const REGLAMENTO_VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "image/gif",
]);

function extFromMime(mime: string): "mp4" | "webm" | "gif" | null {
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";
  if (mime === "image/gif") return "gif";
  return null;
}

export async function uploadReglamentoVideo(
  file: File,
  userId: string
): Promise<
  { ok: true; url: string; mimeType: string } | { ok: false; error: string }
> {
  if (file.size > REGLAMENTO_VIDEO_MAX_BYTES) {
    return { ok: false, error: "El archivo no puede superar 80 MB" };
  }
  if (!REGLAMENTO_VIDEO_MIME.has(file.type)) {
    return { ok: false, error: "Formato no permitido (MP4, WebM o GIF)" };
  }
  const ext = extFromMime(file.type);
  if (!ext) {
    return { ok: false, error: "Formato de video no reconocido" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from(REGLAMENTO_VIDEOS_BUCKET)
    .upload(path, buf, { contentType: file.type, upsert: false });

  if (upErr) {
    return {
      ok: false,
      error: upErr.message.includes("Bucket not found")
        ? `Creá el bucket público "${REGLAMENTO_VIDEOS_BUCKET}" en Supabase Storage`
        : upErr.message,
    };
  }

  const { data } = supabase.storage.from(REGLAMENTO_VIDEOS_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl, mimeType: file.type };
}
