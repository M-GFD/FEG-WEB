"use server";

import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const schema = z
  .object({
    newPassword: z.string().min(6, "passwordMin"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, errorKey: "signInRequired" };
  }

  const parsed = schema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const errorKey = parsed.error.errors[0]?.message ?? "invalidData";
    return { ok: false as const, errorKey };
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
