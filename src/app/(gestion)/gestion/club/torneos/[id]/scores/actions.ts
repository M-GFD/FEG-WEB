"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getTournamentById } from "@/lib/data";
import {
  parseHoleScores,
  computeNet,
  scorecardToDbFields,
} from "@/lib/scorecard";
import { parseTournamentTee } from "@/lib/whs-handicap";
import {
  recalculatePlayerHandicapIndex,
  upsertPublishedHandicapRound,
} from "@/lib/handicap-recalc";
import type { Category } from "@prisma/client";

async function checkClubAccess(tournamentId: string) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "No autorizado" };
  if (session.user.role === "ADMIN") return { ok: true };

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) return { ok: false, error: "Torneo no encontrado" };
  if (session.user.clubId !== tournament.clubId)
    return { ok: false, error: "No tienes acceso a este torneo" };
  if (session.user.role !== "CLUB" && session.user.role !== "DIRECTOR")
    return { ok: false, error: "Rol insuficiente" };

  return { ok: true };
}

export async function saveScorecard(formData: FormData) {
  const entryId = formData.get("entryId") as string;
  const scores = parseHoleScores(formData);

  const scoreCount = Object.keys(scores).length;
  if (scoreCount < 18) return { ok: false, error: "Faltan hoyos por completar" };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Configuración incompleta" };

  const { data: entry } = await supabase
    .from("TournamentEntry")
    .select("*")
    .eq("id", entryId)
    .single();

  if (!entry) return { ok: false, error: "Inscripción no encontrada" };

  const { data: player } = await supabase
    .from("Player")
    .select("handicap,handicapIndex")
    .eq("id", entry.playerId)
    .single();

  const { data: trow } = await supabase
    .from("Tournament")
    .select("whsSlopeRating,whsCourseRating,whsPar")
    .eq("id", entry.tournamentId)
    .single();

  const access = await checkClubAccess(entry.tournamentId);
  if (!access.ok) return { ok: false, error: access.error };

  const fields = scorecardToDbFields(scores);
  const gross = fields.gross;
  const tee = parseTournamentTee(trow ?? {});
  const pl = player as { handicap: number; handicapIndex: number | null } | null;
  const net =
    gross != null && pl
      ? computeNet(gross, entry.category as Category, {
          handicap: pl.handicap ?? 0,
          handicapIndex: pl.handicapIndex,
        }, tee)
      : null;

  const { data: existing } = await supabase
    .from("Scorecard")
    .select("id")
    .eq("entryId", entryId)
    .single();

  const row = {
    status: "DRAFT",
    ...fields,
    net,
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("Scorecard").update(row).eq("entryId", entryId);
  } else {
    await supabase.from("Scorecard").insert({
      id: crypto.randomUUID(),
      entryId,
      ...row,
      createdAt: new Date().toISOString(),
    });
  }

  revalidatePath(`/gestion/club/torneos/${entry.tournamentId}/scores`);
  return { ok: true, message: "Borrador guardado" };
}

export async function publishTournamentScores(tournamentId: string) {
  const access = await checkClubAccess(tournamentId);
  if (!access.ok) return { ok: false, error: access.error };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Configuración incompleta" };

  const tournament = await getTournamentById(tournamentId);
  if (!tournament) return { ok: false, error: "Torneo no encontrado" };

  const entries = tournament.entries ?? [];

  const incomplete = entries.filter(
    (e: { scorecard: { status: string; gross: number } }) =>
      !e.scorecard ||
      e.scorecard.status === "PENDING" ||
      e.scorecard.gross == null
  );
  if (incomplete.length > 0)
    return {
      ok: false,
      error: `Faltan hoyos por completar en ${incomplete.length} tarjeta(s)`,
    };

  const withNet = entries
    .filter((e: { scorecard: { gross: number; net: number } }) => e.scorecard?.gross != null)
    .map((e: { scorecard: { gross: number; net: number }; id: string; playerId: string; category: string }) => ({
      ...e,
      net: e.scorecard!.net ?? e.scorecard!.gross!,
    }));

  const byCategory = new Map<Category, typeof withNet>();
  for (const e of withNet) {
    const list = byCategory.get(e.category as Category) ?? [];
    list.push(e);
    byCategory.set(e.category as Category, list);
  }

  const entriesWithPosition: { id: string; playerId: string; position: number }[] = [];
  for (const [, list] of byCategory) {
    const isScratch =
      list[0]?.category === "DAMAS_SCRATCH" ||
      list[0]?.category === "CABALLEROS_SCRATCH";
    const sorted = [...list].sort((a, b) => {
      if (isScratch)
        return (a.scorecard!.gross ?? 999) - (b.scorecard!.gross ?? 999);
      return (a.net ?? 999) - (b.net ?? 999);
    });
    let pos = 1;
    for (const e of sorted) {
      entriesWithPosition.push({ id: e.id, playerId: e.playerId, position: pos++ });
    }
  }

  // Handicap: primero persistir rondas y recalcular índices; si falla, no publicamos torneo ni tarjetas.
  const tMeta = tournament as {
    id: string;
    date: string;
    whsSlopeRating?: number | null;
    whsCourseRating?: number | null;
    whsPar?: number | null;
  };
  const playedAt =
    typeof tMeta.date === "string"
      ? tMeta.date.slice(0, 10)
      : new Date(tMeta.date).toISOString().slice(0, 10);

  const playersToRecalc = new Set<string>();
  for (const e of entries as Array<{
    id: string;
    playerId: string;
    scorecard: { gross: number | null } | null;
  }>) {
    const gross = e.scorecard?.gross;
    if (gross == null) continue;

    const r = await upsertPublishedHandicapRound(supabase, {
      playerId: e.playerId,
      tournamentId,
      tournamentEntryId: e.id,
      playedAt,
      gross,
      tournament: tMeta,
    });
    if (!r.ok) {
      return {
        ok: false,
        error: r.error ?? "No se pudo registrar la ronda para handicap",
      };
    }
    playersToRecalc.add(e.playerId);
  }

  for (const playerId of playersToRecalc) {
    const hi = await recalculatePlayerHandicapIndex(supabase, playerId);
    if (!hi.ok) {
      return {
        ok: false,
        error: hi.error ?? "Error al recalcular handicap del jugador",
      };
    }
  }

  for (const row of entriesWithPosition) {
    await supabase
      .from("Scorecard")
      .update({
        status: "PUBLISHED",
        position: row.position,
        updatedAt: new Date().toISOString(),
      })
      .eq("entryId", row.id);
  }

  await supabase
    .from("Tournament")
    .update({ status: "PUBLISHED", updatedAt: new Date().toISOString() })
    .eq("id", tournamentId);

  const year = new Date().getFullYear();
  const mult = (tournament as { multiplier?: number }).multiplier ?? 1;
  const POINTS = [0, 20, 10, 8, 5, 2, 1];

  for (const e of entriesWithPosition) {
    const pts = e.position >= 1 && e.position <= 6 ? POINTS[e.position] * mult : 0;
    if (pts === 0) continue;

    const newDate = { tournamentId, points: pts, position: e.position };

    const { data: existing } = await supabase
      .from("RankingEntry")
      .select("bestDates")
      .eq("playerId", e.playerId as string)
      .eq("year", year)
      .single();

    const dates = (existing?.bestDates as { tournamentId: string; points: number; position: number }[] | null) ?? [];
    const merged = [...dates.filter((d) => d.tournamentId !== tournamentId), newDate]
      .sort((a, b) => b.points - a.points)
      .slice(0, 6);
    const totalPoints = merged.reduce((s, d) => s + d.points, 0);

    if (existing) {
      await supabase
        .from("RankingEntry")
        .update({ points: totalPoints, bestDates: merged })
        .eq("playerId", e.playerId as string)
        .eq("year", year);
    } else {
      await supabase.from("RankingEntry").insert({
        id: crypto.randomUUID(),
        playerId: e.playerId,
        year,
        points: totalPoints,
        bestDates: merged,
      });
    }
  }

  revalidatePath(`/gestion/club/torneos/${tournamentId}/scores`);
  revalidatePath(`/torneos`);
  revalidatePath(`/ranking`);
  revalidatePath(`/buscar`);
  for (const playerId of playersToRecalc) {
    revalidatePath(`/jugadores/${playerId}`);
  }
  return { ok: true, message: "Resultados publicados" };
}
