"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getClubs } from "@/lib/data";
import { slugifyTitle } from "@/lib/slugify";
import { contentAudienceFromForm } from "@/lib/content-audience";
import { recalculatePlayerHandicapIndex } from "@/lib/handicap-recalc";
import { z } from "zod";

const createTournamentSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  date: z.string().min(1, "La fecha es obligatoria"),
  clubId: z.string().min(1, "Seleccioná un club"),
  isTeamEvent: z.boolean().optional(),
  audience: z.enum(["GENERAL", "MENORES", "MAYORES"]).optional().default("GENERAL"),
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
    audience: contentAudienceFromForm(String(formData.get("audience") ?? "GENERAL")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  const { name, date, clubId, isTeamEvent, audience } = parsed.data;

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
    audience,
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

export type AdminTournamentRow = {
  id: string;
  name: string;
  slug: string;
  date: string;
  status: string;
  clubName: string;
};

export async function getAdminTournamentsForDelete(): Promise<AdminTournamentRow[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return [];

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: tournaments, error } = await supabase
    .from("Tournament")
    .select("id, name, slug, date, status, clubId")
    .order("date", { ascending: false })
    .limit(100);

  if (error || !tournaments?.length) return [];

  const clubIds = [...new Set(tournaments.map((t) => t.clubId as string))];
  const { data: clubs } = await supabase.from("Club").select("id, name").in("id", clubIds);
  const clubMap = Object.fromEntries(
    (clubs ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
  );

  return tournaments.map((t) => ({
    id: t.id as string,
    name: t.name as string,
    slug: t.slug as string,
    date: t.date as string,
    status: t.status as string,
    clubName: clubMap[t.clubId as string] ?? "—",
  }));
}

const deleteTournamentSchema = z.object({
  tournamentId: z.string().min(1, "Torneo inválido"),
});

type RankingDateRow = { tournamentId: string; points: number; position: number };

async function cleanupRankingReferences(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  tournamentId: string
) {
  const { data: rows } = await supabase
    .from("RankingEntry")
    .select("id, bestDates");

  for (const row of rows ?? []) {
    const dates = (row.bestDates as RankingDateRow[] | null) ?? [];
    if (!dates.some((d) => d.tournamentId === tournamentId)) continue;

    const merged = dates
      .filter((d) => d.tournamentId !== tournamentId)
      .sort((a, b) => b.points - a.points)
      .slice(0, 6);
    const totalPoints = merged.reduce((sum, d) => sum + d.points, 0);

    await supabase
      .from("RankingEntry")
      .update({ bestDates: merged, points: totalPoints, updatedAt: new Date().toISOString() })
      .eq("id", row.id as string);
  }
}

export async function deleteTournament(
  tournamentId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false, error: "No autorizado" };
  }

  const parsed = deleteTournamentSchema.safeParse({ tournamentId });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Base de datos no disponible" };
  }

  const id = parsed.data.tournamentId;

  const { data: tournament } = await supabase
    .from("Tournament")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!tournament) {
    return { ok: false, error: "No se encontró el torneo" };
  }

  const { data: publishedRounds } = await supabase
    .from("PublishedHandicapRound")
    .select("playerId")
    .eq("tournamentId", id);

  const playerIdsToRecalc = [
    ...new Set((publishedRounds ?? []).map((r) => r.playerId as string)),
  ];

  await cleanupRankingReferences(supabase, id);

  await supabase.from("Photo").update({ tournamentId: null }).eq("tournamentId", id);

  const { error } = await supabase.from("Tournament").delete().eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

  for (const playerId of playerIdsToRecalc) {
    await recalculatePlayerHandicapIndex(supabase, playerId);
  }

  revalidatePath("/gestion/admin/torneos/eliminar");
  revalidatePath("/gestion/admin/torneos");
  revalidatePath("/gestion/club");
  revalidatePath("/torneos");
  revalidatePath("/ranking");
  revalidatePath("/buscar");

  return { ok: true };
}
