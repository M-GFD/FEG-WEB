"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  body: z.string().min(1, "La descripción es obligatoria").max(5000),
  videoUrl: z.string().url("URL de video inválida"),
  mimeType: z.enum(["video/mp4", "video/webm", "image/gif"]),
});

export async function createReglamentoVideo(input: {
  title: string;
  body: string;
  videoUrl: string;
  mimeType: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "No autorizado" };
  }

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false as const, error: "Base de datos no disponible" };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("ReglamentoVideo").insert({
    id: crypto.randomUUID(),
    title: parsed.data.title.trim(),
    body: parsed.data.body.trim(),
    videoUrl: parsed.data.videoUrl,
    mimeType: parsed.data.mimeType,
    published: true,
    authorId: session.user.id,
    createdAt: now,
    updatedAt: now,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/institucional/reglamento/videos");
  return { ok: true as const };
}

const MAX_BULK_DELETE = 50;

const deleteIdsSchema = z.array(z.string().min(1)).min(1).max(MAX_BULK_DELETE);

/** Elimina videos publicados por id (solo admin). No borra archivos en Storage. */
export async function deleteReglamentoVideosByIds(
  videoIds: string[]
): Promise<{ ok: true; deleted: number } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, error: "No autorizado" };
  }

  const parsed = deleteIdsSchema.safeParse(
    [...new Set(videoIds.map((id) => id?.trim()).filter(Boolean))]
  );
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Selección inválida",
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Base de datos no disponible" };
  }

  const ids = parsed.data;
  const { data: rows, error: selErr } = await supabase
    .from("ReglamentoVideo")
    .select("id")
    .in("id", ids)
    .eq("published", true);

  if (selErr) {
    console.error("[deleteReglamentoVideosByIds] select", selErr.message);
    return { ok: false, error: selErr.message };
  }

  const toDelete = rows ?? [];
  if (toDelete.length === 0) {
    return { ok: false, error: "No hay videos publicados con esos identificadores." };
  }

  const deleteIds = toDelete.map((r: { id: string }) => r.id);
  const { error } = await supabase.from("ReglamentoVideo").delete().in("id", deleteIds);

  if (error) {
    console.error("[deleteReglamentoVideosByIds]", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/gestion/admin/reglamento-videos/eliminar");
  revalidatePath("/institucional/reglamento/videos");
  return { ok: true, deleted: deleteIds.length };
}
