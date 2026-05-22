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

export function validateReglamentoVideoFile(
  mimeType: string,
  fileSize: number
): { ok: true; ext: string } | { ok: false; error: string } {
  if (fileSize > REGLAMENTO_VIDEO_MAX_BYTES) {
    return { ok: false, error: "El archivo no puede superar 80 MB" };
  }
  if (!REGLAMENTO_VIDEO_MIME.has(mimeType)) {
    return { ok: false, error: "Formato no permitido (MP4, WebM o GIF)" };
  }
  const ext = extFromMime(mimeType);
  if (!ext) {
    return { ok: false, error: "Formato de video no reconocido" };
  }
  return { ok: true, ext };
}

export type ReglamentoVideoSignedUpload = {
  bucket: string;
  path: string;
  token: string;
  /** PUT directo desde el browser; el token va en query ?token= */
  signedUploadUrl: string;
  publicUrl: string;
  mimeType: string;
};

/**
 * Genera URL firmada para subida directa a Storage (evita límite de body en Vercel).
 */
export async function createReglamentoVideoSignedUpload(
  userId: string,
  mimeType: string,
  fileSize: number
): Promise<
  { ok: true; upload: ReglamentoVideoSignedUpload } | { ok: false; error: string }
> {
  const validated = validateReglamentoVideoFile(mimeType, fileSize);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const path = `${userId}/${crypto.randomUUID()}.${validated.ext}`;
  const { data, error } = await supabase.storage
    .from(REGLAMENTO_VIDEOS_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return {
      ok: false,
      error: error?.message.includes("Bucket not found")
        ? `Creá el bucket público "${REGLAMENTO_VIDEOS_BUCKET}" en Supabase Storage`
        : error?.message ?? "No se pudo preparar la subida",
    };
  }

  const { data: pub } = supabase.storage.from(REGLAMENTO_VIDEOS_BUCKET).getPublicUrl(path);

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return { ok: false, error: "NEXT_PUBLIC_SUPABASE_URL no configurada" };
  }
  const encodedPath = path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  const signedUploadUrl = `${baseUrl}/storage/v1/object/upload/sign/${REGLAMENTO_VIDEOS_BUCKET}/${encodedPath}`;

  return {
    ok: true,
    upload: {
      bucket: REGLAMENTO_VIDEOS_BUCKET,
      path: data.path,
      token: data.token,
      signedUploadUrl,
      publicUrl: pub.publicUrl,
      mimeType,
    },
  };
}
