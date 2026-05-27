"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { buildTournamentKey } from "@/lib/inscripcion-torneos-menores/tournament-key";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  dateLabel: z.string().min(1),
  extraLine: z.string().optional(),
  venue: z.string().min(1),
  fecha: z.string().min(1),
  sede: z.string().min(1),
  modalidad: z.string().min(1),
});

export async function saveActiveYouthTournamentConfig(input: z.infer<typeof schema>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "No autorizado" };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Datos inválidos" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false as const, error: "Base de datos no disponible" };
  }

  const d = parsed.data;
  const tournamentKey = buildTournamentKey(d.fecha, d.sede, d.modalidad);
  const now = new Date().toISOString();

  await supabase.from("YouthTournamentSignupConfig").update({ isActive: false }).eq("isActive", true);

  const { error } = await supabase.from("YouthTournamentSignupConfig").upsert(
    {
      id: crypto.randomUUID(),
      isActive: true,
      title: d.title.trim(),
      dateLabel: d.dateLabel.trim(),
      extraLine: d.extraLine?.trim() || null,
      venue: d.venue.trim(),
      fecha: d.fecha.trim(),
      sede: d.sede.trim(),
      modalidad: d.modalidad.trim(),
      tournamentKey,
      updatedAt: now,
      createdAt: now,
    },
    { onConflict: "tournamentKey" }
  );

  if (error) {
    console.error("[saveActiveYouthTournamentConfig]", error.message);
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/torneos");
  revalidatePath("/inscripcion-torneos-menores");
  revalidatePath("/gestion/club");
  revalidatePath("/gestion/club/inscriptos");
  return { ok: true as const };
}
