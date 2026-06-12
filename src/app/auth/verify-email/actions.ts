"use server";

import { consumeUserToken, createUserToken } from "@/lib/user-tokens";
import { getSupabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/app-url";
import { sendVerifyEmail } from "@/lib/email";

export async function verifyEmail(emailRaw: string, token: string) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!email || !token) return { ok: false as const, errorKey: "invalidLink" };

  const consumed = await consumeUserToken({ purpose: "verify", email, token });
  if (!consumed.ok) {
    const errorKey = consumed.reason === "expired" ? "expired" : "invalid";
    return { ok: false as const, errorKey };
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  if (supabase) {
    const { error } = await supabase
      .from("User")
      .update({ emailVerified: now, updatedAt: now })
      .eq("email", email);
    if (error) return { ok: false as const, errorKey: "invalidLink", errorMessage: error.message };
    return { ok: true as const };
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return { ok: true as const };
}

export async function resendVerification(emailRaw: string) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!email) return { ok: true as const };

  const supabase = getSupabaseAdmin();
  const user =
    supabase
      ? (await supabase.from("User").select("emailVerified").eq("email", email).maybeSingle()).data
      : await prisma.user.findUnique({ where: { email }, select: { emailVerified: true } }).catch(() => null);

  if (!user) return { ok: true as const };
  if ((user as { emailVerified?: string | null }).emailVerified) return { ok: true as const };

  const { token } = await createUserToken({ purpose: "verify", email, ttlMs: 24 * 60 * 60 * 1000 });
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  await sendVerifyEmail({ to: email, verifyUrl });
  return { ok: true as const };
}
