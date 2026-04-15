"use server";

import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getClubs } from "@/lib/data";
import { slugifyTitle } from "@/lib/slugify";
import { z } from "zod";

const createTournamentSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  date: z.string().min(1, "La fecha es obligatoria"),
  clubId: z.string().min(1, "Seleccioná un club"),
  isTeamEvent: z.boolean().optional(),
});

export async function getClubsForTournament() {
  return getClubs();
}

export async function createTournament(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, error: "No autorizado" };
  }

  const parsed = createTournamentSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    clubId: formData.get("clubId"),
    isTeamEvent: formData.get("isTeamEvent") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  const { name, date, clubId, isTeamEvent } = parsed.data;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Base de datos no disponible" };
  }

  const baseSlug = slugifyTitle(name);
  let finalSlug = baseSlug || "torneo";
  for (let n = 0; n < 200; n++) {
    const candidate = n === 0 ? finalSlug : `${finalSlug}-${n}`;
    const { data } = await supabase
      .from("Tournament")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) {
      finalSlug = candidate;
      break;
    }
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("Tournament").insert({
    id: crypto.randomUUID(),
    name: name.trim(),
    slug: finalSlug,
    date: new Date(date).toISOString(),
    clubId,
    isTeamEvent: isTeamEvent ?? false,
    multiplier: 1,
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
