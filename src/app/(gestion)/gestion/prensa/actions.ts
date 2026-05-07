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
