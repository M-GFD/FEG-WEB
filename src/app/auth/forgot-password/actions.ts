"use server";

import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { createUserToken } from "@/lib/user-tokens";
import { getBaseUrl } from "@/lib/app-url";
import { sendResetPasswordEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().min(1).email().transform((v) => v.trim().toLowerCase()),
});

export async function requestPasswordReset(formData: FormData) {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: true as const };

  const email = parsed.data.email;

  // Respuesta siempre OK para evitar enumeración de usuarios.
  const supabase = getSupabaseAdmin();
  const user =
    supabase
      ? (await supabase.from("User").select("id,email").eq("email", email).maybeSingle()).data
      : await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } }).catch(() => null);

  if (!user) return { ok: true as const };

  const { token } = await createUserToken({
    purpose: "reset",
    email,
    ttlMs: 60 * 60 * 1000,
  });

  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

  await sendResetPasswordEmail({ to: email, resetUrl });
  return { ok: true as const };
}

