"use server";

import { hash } from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getClubs } from "@/lib/data";
import { z } from "zod";

const ROLES = ["ADMIN", "CLUB", "PRESS", "DIRECTOR", "TREASURER"] as const;

const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "El email es obligatorio")
      .email("Email inválido")
      .transform((v) => v.trim().toLowerCase()),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(ROLES, { required_error: "Selecciona un tipo de cuenta" }),
    clubId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "CLUB") return !!data.clubId?.trim();
      return true;
    },
    { message: "Selecciona un club", path: ["clubId"] }
  );

export async function getClubsForSignup() {
  return getClubs();
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    clubId: formData.get("clubId") || undefined,
  });

  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Datos inválidos";
    return { ok: false, error: msg };
  }

  const { email, password, role, clubId } = parsed.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      ok: false,
      error:
        "Configuración incompleta. Añade NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local",
    };
  }

  const { data: existing } = await supabase
    .from("User")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con ese email" };
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
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
