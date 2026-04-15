import { getSupabaseAdmin } from "./supabase";

export const NEWS_IMAGES_BUCKET =
  process.env.SUPABASE_NEWS_BUCKET?.trim() || "news-images";

const NEWS_IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

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
