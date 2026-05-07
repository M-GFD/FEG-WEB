"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { canModeratePress } from "@/lib/rbac";

async function requireModeratePress() {
  const session = await auth();
  if (!session?.user || !canModeratePress(session.user.role)) {
    throw new Error("No autorizado");
  }
  return session;
}

export async function approvePhoto(photoId: string) {
  const session = await requireModeratePress();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase
      .from("Photo")
      .update({
        status: "APPROVED",
        approvedBy: session.user.id,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", photoId);
  }
  revalidatePath("/gestion/prensa");
  revalidatePath("/prensa");
}

export async function rejectPhoto(photoId: string) {
  await requireModeratePress();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase
      .from("Photo")
      .update({
        status: "REJECTED",
        approvedBy: null,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", photoId);
  }
  revalidatePath("/gestion/prensa");
}

export async function togglePhotoFeatured(photoId: string, featured: boolean) {
  await requireModeratePress();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase
      .from("Photo")
      .update({
        featured,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", photoId)
      .eq("status", "APPROVED");
  }
  revalidatePath("/gestion/prensa");
  revalidatePath("/prensa");
}

const MAX_BULK_DELETE = 50;

/**
 * Elimina noticias **publicadas** por id (solo prensa/admin).
 * No borra archivos en storage; solo la fila en `News`.
 */
export async function deletePublishedNewsByIds(
  newsIds: string[]
): Promise<{ ok: true; deleted: number } | { ok: false; error: string }> {
  try {
    await requireModeratePress();
  } catch {
    return { ok: false, error: "No autorizado" };
  }

  const ids = [...new Set(newsIds.map((id) => id?.trim()).filter(Boolean))] as string[];
  if (ids.length === 0) {
    return { ok: false, error: "No seleccionaste ninguna noticia." };
  }
  if (ids.length > MAX_BULK_DELETE) {
    return { ok: false, error: `Máximo ${MAX_BULK_DELETE} noticias por operación.` };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Configuración de base de datos incompleta." };
  }

  const { data: rows, error: selErr } = await supabase
    .from("News")
    .select("id,slug")
    .in("id", ids)
    .eq("published", true);

  if (selErr) {
    console.error("[deletePublishedNewsByIds] select", selErr.message);
    return { ok: false, error: selErr.message };
  }

  const toDelete = rows ?? [];
  if (toDelete.length === 0) {
    return { ok: false, error: "No hay noticias publicadas con esos identificadores." };
  }

  const deleteIds = toDelete.map((r: { id: string }) => r.id);

  const { error } = await supabase.from("News").delete().in("id", deleteIds);

  if (error) {
    console.error("[deletePublishedNewsByIds]", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/gestion/prensa");
  revalidatePath("/noticias");
  revalidatePath("/");
  revalidatePath("/buscar");

  for (const row of toDelete as { slug: string }[]) {
    if (row.slug) revalidatePath(`/noticias/${row.slug}`);
  }

  return { ok: true, deleted: toDelete.length };
}
