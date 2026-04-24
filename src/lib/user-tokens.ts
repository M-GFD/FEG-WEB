import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

type TokenPurpose = "verify" | "reset";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function identifierFor(purpose: TokenPurpose, email: string) {
  return `${purpose}:${email.trim().toLowerCase()}`;
}

export async function createUserToken(args: {
  purpose: TokenPurpose;
  email: string;
  ttlMs: number;
}) {
  const email = args.email.trim().toLowerCase();
  const identifier = identifierFor(args.purpose, email);
  const tokenPlain = randomToken();
  const tokenHash = sha256(tokenPlain);
  const expires = new Date(Date.now() + args.ttlMs);

  const supabase = getSupabaseAdmin();
  if (supabase) {
    // Limpiar tokens previos del mismo propósito/email
    await supabase.from("VerificationToken").delete().eq("identifier", identifier);
    const { error } = await supabase.from("VerificationToken").insert({
      identifier,
      token: tokenHash,
      expires: expires.toISOString(),
    });
    if (error) throw new Error(error.message);
    return { token: tokenPlain, expires };
  }

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: tokenHash, expires },
  });
  return { token: tokenPlain, expires };
}

export async function consumeUserToken(args: {
  purpose: TokenPurpose;
  email: string;
  token: string;
}) {
  const email = args.email.trim().toLowerCase();
  const identifier = identifierFor(args.purpose, email);
  const tokenHash = sha256(args.token);
  const now = new Date();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("VerificationToken")
      .select("token, expires")
      .eq("identifier", identifier)
      .eq("token", tokenHash)
      .maybeSingle();
    if (error) return { ok: false as const, reason: "db" as const };
    if (!data) return { ok: false as const, reason: "invalid" as const };
    const expires = new Date(String((data as { expires: string }).expires));
    if (!(expires instanceof Date) || Number.isNaN(expires.getTime()) || expires <= now) {
      await supabase.from("VerificationToken").delete().eq("identifier", identifier);
      return { ok: false as const, reason: "expired" as const };
    }
    await supabase.from("VerificationToken").delete().eq("identifier", identifier).eq("token", tokenHash);
    return { ok: true as const };
  }

  const found = await prisma.verificationToken.findFirst({
    where: { identifier, token: tokenHash },
    select: { expires: true },
  });
  if (!found) return { ok: false as const, reason: "invalid" as const };
  if (found.expires <= now) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return { ok: false as const, reason: "expired" as const };
  }
  await prisma.verificationToken.deleteMany({ where: { identifier, token: tokenHash } });
  return { ok: true as const };
}

