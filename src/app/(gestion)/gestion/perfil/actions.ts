"use server";

import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessGestionArea } from "@/lib/gestion-access";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z
  .object({
    currentPassword: z.string().min(1, "currentRequired"),
    newPassword: z.string().min(6, "passwordMin"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

async function getUserPasswordHash(userId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase.from("User").select("password").eq("id", userId).single();
    return data?.password ?? null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    return user?.password ?? null;
  } catch {
    return null;
  }
}

export async function changePasswordFromProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, errorKey: "signInRequired" };
  }

  if (!canAccessGestionArea(session.user.role, "perfil")) {
    return { ok: false as const, errorKey: "unauthorized" };
  }

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const errorKey = parsed.error.errors[0]?.message ?? "invalidData";
    return { ok: false as const, errorKey };
  }

  const storedHash = await getUserPasswordHash(session.user.id);
  if (!storedHash) {
    return { ok: false as const, errorKey: "userNotFound" };
  }

  const currentValid = await compare(parsed.data.currentPassword, storedHash);
  if (!currentValid) {
    return { ok: false as const, errorKey: "currentIncorrect" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false as const, errorKey: "configIncomplete" };
  }

  const hashedPassword = await hash(parsed.data.newPassword, 12);

  const { error } = await supabase
    .from("User")
    .update({
      password: hashedPassword,
      mustChangePassword: false,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", session.user.id);

  if (error) {
    return { ok: false as const, errorKey: "error", errorMessage: error.message };
  }

  return { ok: true as const };
}
