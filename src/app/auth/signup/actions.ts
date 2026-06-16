"use server";

import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getClubs } from "@/lib/data";
import { z } from "zod";
import { sendAccountVerificationEmail } from "@/lib/account-verification-email";

const ROLES = ["ADMIN", "CLUB", "PRESS", "DIRECTOR", "TREASURER"] as const;

const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "emailRequired")
      .email("emailInvalid")
      .transform((v) => v.trim().toLowerCase()),
    password: z.string().min(6, "passwordMin"),
    confirmPassword: z.string(),
    role: z.enum(ROLES, { required_error: "roleRequired" }),
    clubId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "CLUB") return !!data.clubId?.trim();
      return true;
    },
    { message: "clubRequired", path: ["clubId"] }
  );

export async function getClubsForSignup() {
  return getClubs();
}

export async function signUp(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, errorKey: "unauthorized" };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    clubId: formData.get("clubId") || undefined,
  });

  if (!parsed.success) {
    const errorKey = parsed.error.errors[0]?.message ?? "invalidData";
    return { ok: false as const, errorKey };
  }

  const { email, password, role, clubId } = parsed.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false as const, errorKey: "configIncomplete" };
  }

  const { data: existing } = await supabase
    .from("User")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { ok: false as const, errorKey: "emailExists" };
  }

  const hashedPassword = await hash(password, 12);
  const now = new Date().toISOString();

  const { error } = await supabase.from("User").insert({
    id: crypto.randomUUID(),
    email,
    password: hashedPassword,
    name: email.split("@")[0],
    role,
    clubId: role === "CLUB" && clubId ? clubId : null,
    createdAt: now,
    updatedAt: now,
  });

  if (error) {
    return { ok: false as const, errorKey: "registerError", errorMessage: error.message };
  }

  await sendAccountVerificationEmail(email);

  return { ok: true as const };
}
