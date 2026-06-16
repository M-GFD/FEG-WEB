import { createUserToken } from "@/lib/user-tokens";
import { getBaseUrl } from "@/lib/app-url";
import { sendVerifyEmail } from "@/lib/email";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

/** Genera token y envía el correo de verificación para activar una cuenta nueva. */
export async function sendAccountVerificationEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const { token } = await createUserToken({
    purpose: "verify",
    email: normalized,
    ttlMs: VERIFY_TTL_MS,
  });
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/auth/verify-email?email=${encodeURIComponent(normalized)}&token=${encodeURIComponent(token)}`;
  return sendVerifyEmail({ to: normalized, verifyUrl });
}
