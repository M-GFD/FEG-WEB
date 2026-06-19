import { revalidatePath } from "next/cache";
import type { getSupabaseAdmin } from "@/lib/supabase";
import { recalculatePlayerHandicapIndex } from "@/lib/handicap-recalc";

type SupabaseAdmin = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

type RankingDateRow = { tournamentId: string; points: number; position: number };

export type TournamentDeleteTarget = {
  id: string;
  name: string;
  clubId: string;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

async function cleanupRankingReferences(supabase: SupabaseAdmin, tournamentId: string) {
  const { data: rows } = await supabase.from("RankingEntry").select("id, bestDates");

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

/** Borra inscripciones menores y config activa vinculada al torneo federativo. */
export async function cleanupYouthTournamentSignupForTournament(
  supabase: SupabaseAdmin,
  tournament: TournamentDeleteTarget
) {
  const { data: configs } = await supabase
    .from("YouthTournamentSignupConfig")
    .select("id, tournamentKey, title, tournamentId");

  const keysToPurge = new Set<string>();

  for (const cfg of configs ?? []) {
    const linkedId = (cfg as { tournamentId?: string | null }).tournamentId;
    if (linkedId === tournament.id) {
      keysToPurge.add(cfg.tournamentKey as string);
      continue;
    }

    if (normalizeText(String(cfg.title ?? "")) === normalizeText(tournament.name)) {
      keysToPurge.add(cfg.tournamentKey as string);
    }
  }

  for (const key of keysToPurge) {
    await supabase.from("YouthTournamentRegistration").delete().eq("tournamentKey", key);
    await supabase.from("YouthTournamentSignupConfig").delete().eq("tournamentKey", key);
  }
}

/** Elimina dependencias antes de borrar la fila Tournament (por si faltan CASCADE en DB). */
export async function deleteTournamentDependents(
  supabase: SupabaseAdmin,
  tournamentId: string
) {
  const { data: entries } = await supabase
    .from("TournamentEntry")
    .select("id")
    .eq("tournamentId", tournamentId);
  const entryIds = (entries ?? []).map((e) => e.id as string);

  if (entryIds.length > 0) {
    await supabase.from("Scorecard").delete().in("entryId", entryIds);
  }

  await supabase.from("PublishedHandicapRound").delete().eq("tournamentId", tournamentId);
  await supabase.from("TournamentEntry").delete().eq("tournamentId", tournamentId);

  const { data: teams } = await supabase
    .from("TeamEntry")
    .select("id")
    .eq("tournamentId", tournamentId);
  const teamIds = (teams ?? []).map((t) => t.id as string);

  if (teamIds.length > 0) {
    await supabase.from("TeamPlayer").delete().in("teamEntryId", teamIds);
  }
  await supabase.from("TeamEntry").delete().eq("tournamentId", tournamentId);

  await supabase.from("Photo").update({ tournamentId: null }).eq("tournamentId", tournamentId);
}

/** Vincula config de inscripciones menores existente al torneo recién creado (mismo título). */
export async function linkYouthSignupConfigToTournament(
  supabase: SupabaseAdmin,
  tournamentId: string,
  tournamentName: string
) {
  const name = tournamentName.trim();
  if (!name) return;

  await supabase
    .from("YouthTournamentSignupConfig")
    .update({ tournamentId, updatedAt: new Date().toISOString() })
    .eq("title", name)
    .is("tournamentId", null);
}

export function revalidateAfterTournamentDelete(tournamentId: string) {
  revalidatePath("/gestion/admin/torneos/eliminar");
  revalidatePath("/gestion/admin/torneos");
  revalidatePath("/gestion/admin/inscriptos");
  revalidatePath("/gestion/admin/inscripcion-torneos-menores");
  revalidatePath("/gestion/club");
  revalidatePath("/gestion/club/torneos");
  revalidatePath("/gestion/club/inscriptos");
  revalidatePath("/gestion/club/fotos");
  revalidatePath(`/gestion/club/torneos/${tournamentId}/scores`);
  revalidatePath("/torneos");
  revalidatePath("/inscripcion-torneos-menores");
  revalidatePath("/ranking");
  revalidatePath("/buscar");
}

export async function purgeTournamentCompletely(
  supabase: SupabaseAdmin,
  tournament: TournamentDeleteTarget
): Promise<{ ok: true } | { ok: false; error: string }> {
  const id = tournament.id;

  const { data: publishedRounds } = await supabase
    .from("PublishedHandicapRound")
    .select("playerId")
    .eq("tournamentId", id);

  const playerIdsToRecalc = [
    ...new Set((publishedRounds ?? []).map((r) => r.playerId as string)),
  ];

  await cleanupRankingReferences(supabase, id);
  await cleanupYouthTournamentSignupForTournament(supabase, tournament);
  await deleteTournamentDependents(supabase, id);

  const { error } = await supabase.from("Tournament").delete().eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

  for (const playerId of playerIdsToRecalc) {
    await recalculatePlayerHandicapIndex(supabase, playerId);
  }

  revalidateAfterTournamentDelete(id);
  return { ok: true };
}
