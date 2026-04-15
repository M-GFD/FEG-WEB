/**
 * Procesamiento de envío de fotos de clubes (Storage + tabla Photo).
 * Usado desde Route Handler POST /api/club-photos para evitar límites/bugs de Server Actions con multipart.
 */

import { getSupabaseAdmin } from "@/lib/supabase";
import { hasRole } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import {
  CLUB_PHOTOS_BUCKET,
  CLUB_PHOTO_ALLOWED_MIME,
  CLUB_PHOTO_MAX_BYTES,
  CLUB_PHOTO_MAX_COUNT,
  extensionFromMime,
} from "@/lib/storage";
import { z } from "zod";

const urlSchema = z
  .string()
  .min(1)
  .url("URL inválida")
  .refine(
    (u) => u.startsWith("https://") || u.startsWith("http://"),
    "Usá http:// o https://"
  );

function collectFiles(formData: FormData): File[] {
  const raw = formData.getAll("files");
  return raw.filter(
    (item): item is File => item instanceof File && item.size > 0
  );
}

export type ClubPhotoSubmitUser = { id: string; role: Role };

export type ClubPhotoSubmitResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

export async function processClubPhotoSubmission(
  formData: FormData,
  user: ClubPhotoSubmitUser
): Promise<ClubPhotoSubmitResult> {
  if (!hasRole(user.role, "CLUB")) {
    return { ok: false, error: "No autorizado" };
  }

  const caption = (formData.get("caption") as string | null)?.trim() || undefined;
  const tournamentId = (formData.get("tournamentId") as string | null)?.trim() || undefined;
  const urlRaw = (formData.get("url") as string | null)?.trim() ?? "";

  const files = collectFiles(formData);

  if (files.length > CLUB_PHOTO_MAX_COUNT) {
    return {
      ok: false,
      error: `Podés subir como máximo ${CLUB_PHOTO_MAX_COUNT} imágenes a la vez.`,
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Configuración incompleta (Supabase)" };
  }

  const tid = tournamentId;
  const now = new Date().toISOString();

  if (files.length > 0) {
    const rows: Array<{
      id: string;
      url: string;
      caption: string | null;
      status: string;
      featured: boolean;
      uploadedBy: string;
      tournamentId: string | null;
      createdAt: string;
      updatedAt: string;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > CLUB_PHOTO_MAX_BYTES) {
        return {
          ok: false,
          error: `El archivo "${file.name}" supera 5 MB.`,
        };
      }
      if (!CLUB_PHOTO_ALLOWED_MIME.has(file.type)) {
        return {
          ok: false,
          error: `Formato no permitido en "${file.name}". Usá PNG, JPG o JPEG.`,
        };
      }
      const ext = extensionFromMime(file.type);
      if (!ext) {
        return {
          ok: false,
          error: `Formato no reconocido: "${file.name}".`,
        };
      }

      const objectPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const bytes = Buffer.from(await file.arrayBuffer());

      const { error: upErr } = await supabase.storage
        .from(CLUB_PHOTOS_BUCKET)
        .upload(objectPath, bytes, {
          contentType: file.type,
          upsert: false,
        });

      if (upErr) {
        const msg = upErr.message.includes("Bucket not found")
          ? `No existe el bucket "${CLUB_PHOTOS_BUCKET}" en Storage. Ver docs/supabase-storage-club-photos.md`
          : upErr.message;
        return { ok: false, error: msg };
      }

      const { data: pub } = supabase.storage
        .from(CLUB_PHOTOS_BUCKET)
        .getPublicUrl(objectPath);

      rows.push({
        id: crypto.randomUUID(),
        url: pub.publicUrl,
        caption: caption || null,
        status: "PENDING",
        featured: false,
        uploadedBy: user.id,
        tournamentId: tid && tid.length > 0 ? tid : null,
        createdAt: now,
        updatedAt: now,
      });
    }

    const { error } = await supabase.from("Photo").insert(rows);
    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, count: rows.length };
  }

  if (urlRaw.length > 0) {
    const parsed = urlSchema.safeParse(urlRaw);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.errors[0]?.message ?? "URL inválida",
      };
    }

    const { error } = await supabase.from("Photo").insert({
      id: crypto.randomUUID(),
      url: parsed.data,
      caption: caption || null,
      status: "PENDING",
      featured: false,
      uploadedBy: user.id,
      tournamentId: tid && tid.length > 0 ? tid : null,
      createdAt: now,
      updatedAt: now,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, count: 1 };
  }

  return {
    ok: false,
    error: "Subí hasta 15 imágenes (PNG, JPG o JPEG) o pegá una URL.",
  };
}
