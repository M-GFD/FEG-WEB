"use server";

import { z } from "zod";
import { hash } from "bcryptjs";
import { consumeUserToken } from "@/lib/user-tokens";
import { getSupabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/db";

const schema = z
  .object({
    email: z.string().min(1).email().transform((v) => v.trim().toLowerCase()),
    token: z.string().min(10),
    password: z.string().min(6, "passwordMin"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordMismatch",
  });

export async function resetPassword(formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const errorKey = parsed.error.errors[0]?.message ?? "invalidData";
    return { ok: false as const, errorKey };
  }

  const { email, token, password } = parsed.data;
  const consumed = await consumeUserToken({ purpose: "reset", email, token });
  if (!consumed.ok) {
    const errorKey = consumed.reason === "expired" ? "expired" : "invalid";
    return { ok: false as const, errorKey };
  }

  const hashed = await hash(password, 12);
  const now = new Date().toISOString();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("User")
      .update({ password: hashed, updatedAt: now, mustChangePassword: false })
      .eq("email", email);
    if (error) return { ok: false as const, errorKey: "failed", errorMessage: error.message };
    return { ok: true as const };
  }

  await prisma.user.update({
    where: { email },
    data: { password: hashed, mustChangePassword: false },
  });
  return { ok: true as const };
}
