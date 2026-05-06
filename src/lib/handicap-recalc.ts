import type { SupabaseClient } from "@supabase/supabase-js";
import { scoreDifferential18, parseTournamentTee } from "@/lib/whs-handicap";
import { handicapIndexFromScoreDifferentials } from "@/lib/whs-handicap-index";

type TournamentWhsRow = {
  id: string;
  date: string;
  whsSlopeRating?: number | null;
  whsCourseRating?: number | null;
  whsPar?: number | null;
};

function roundDiffOneDecimal(d: number): number {
  return Math.round(d * 10) / 10;
}

export async function upsertPublishedHandicapRound(
  supabase: SupabaseClient,
  params: {
    playerId: string;
    tournamentId: string;
    tournamentEntryId: string;
    playedAt: string;
    gross: number;
    tournament: TournamentWhsRow;
  }
): Promise<{ ok: boolean; error?: string }> {
  const tee = parseTournamentTee(params.tournament);
  const raw = scoreDifferential18({
    adjustedGross: params.gross,
    courseRating: tee.courseRating,
    slopeRating: tee.slopeRating,
    pcc: 0,
  });
  if (!Number.isFinite(raw)) {
    return { ok: false, error: "Diferencial inválido (tee/slope)" };
  }
  const differential = roundDiffOneDecimal(raw);

  const iso = new Date().toISOString();
  const playedDate = params.playedAt.slice(0, 10);

  const row = {
    playerId: params.playerId,
    tournamentId: params.tournamentId,
    tournamentEntryId: params.tournamentEntryId,
    playedAt: playedDate,
    gross: params.gross,
    adjustedGross: params.gross,
    differential,
    updatedAt: iso,
  };

  const { data: existing } = await supabase
    .from("PublishedHandicapRound")
    .select("id")
    .eq("tournamentEntryId", params.tournamentEntryId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("PublishedHandicapRound")
      .update(row)
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("PublishedHandicapRound").insert({
      ...row,
      id: crypto.randomUUID(),
      createdAt: iso,
    });
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Recalcula y persiste `handicapIndex` / `handicap` solo si hay ≥3 tarjetas publicadas.
 * Si hay menos, no modifica al jugador (se mantienen valores de padrón/import).
 */
export async function recalculatePlayerHandicapIndex(
  supabase: SupabaseClient,
  playerId: string
): Promise<{
  ok: boolean;
  updated: boolean;
  newIndex: number | null;
  error?: string;
}> {
  const { data: rounds, error } = await supabase
    .from("PublishedHandicapRound")
    .select("differential")
    .eq("playerId", playerId)
    .order("playedAt", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[recalculatePlayerHandicapIndex]", error.message);
    return { ok: false, updated: false, newIndex: null, error: error.message };
  }

  const diffs = (rounds ?? [])
    .map((r: { differential: number }) => r.differential)
    .filter((d) => typeof d === "number" && Number.isFinite(d));

  const newIndex = handicapIndexFromScoreDifferentials(diffs);
  if (newIndex == null) {
    return { ok: true, updated: false, newIndex: null };
  }

  const handicapInt = Math.round(newIndex);
  const { error: upErr } = await supabase
    .from("Player")
    .update({
      handicapIndex: newIndex,
      handicap: handicapInt,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", playerId);

  if (upErr) {
    console.error("[recalculatePlayerHandicapIndex] Player update", upErr.message);
    return {
      ok: false,
      updated: false,
      newIndex: null,
      error: upErr.message,
    };
  }

  return { ok: true, updated: true, newIndex };
}
