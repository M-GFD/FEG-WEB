"use server";

import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getClubs } from "@/lib/data";
import { z } from "zod";

const ALLOWED_ROLES = ["CLUB", "PRESS", "TREASURER"] as const;

const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Email inválido")
    .transform((v) => v.trim().toLowerCase()),
  role: z.enum(ALLOWED_ROLES),
  clubId: z.string().optional(),
  temporaryPassword: z.string().min(6, "Mínimo 6 caracteres"),
});

export async function getClubsForAdmin() {
  return getClubs();
}

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, error: "No autorizado" };
  }

  const role = formData.get("role") as string;

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    role,
    clubId: formData.get("clubId") || undefined,
    temporaryPassword: formData.get("temporaryPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  if (parsed.data.role === "CLUB" && !parsed.data.clubId) {
    return { ok: false, error: "Seleccioná un club para el rol Club" };
  }

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
    .eq("email", parsed.data.email)
    .single();

  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con ese email" };
  }

  const hashedPassword = await hash(parsed.data.temporaryPassword, 12);
  const now = new Date().toISOString();

  const { error } = await supabase.from("User").insert({
    id: crypto.randomUUID(),
    email: parsed.data.email,
    password: hashedPassword,
    name: parsed.data.email.split("@")[0],
    role: parsed.data.role,
    clubId: parsed.data.role === "CLUB" ? parsed.data.clubId : null,
    mustChangePassword: true,
    createdAt: now,
    updatedAt: now,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/** Keep backward compat */
export async function createClubUser(formData: FormData) {
  formData.set("role", "CLUB");
  return createUser(formData);
}
