/**
 * Capa de datos que usa Supabase REST API.
 * Usar cuando Prisma no puede conectar (firewall, etc.)
 */

import { getSupabaseAdmin } from "./supabase";
import {
  formatHandicapRankingCell,
  handicapSortValue,
  keyForRankingCategory,
  labelForRankingCategory,
  slugifyRankingCategoryKey,
} from "./handicap-ranking";

export type TournamentWithClub = {
  id: string;
  name: string;
  slug: string;
  date: string;
  clubId: string;
  status: string;
  club: { name: string };
};

export async function getTournaments(options?: {
  clubId?: string | null;
  isAdmin?: boolean;
  limit?: number;
}): Promise<TournamentWithClub[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("Tournament")
    .select("*")
    .order("date", { ascending: false })
    .limit(options?.limit ?? 50);

  if (!options?.isAdmin && options?.clubId) {
    query = query.eq("clubId", options.clubId);
  } else if (!options?.isAdmin && !options?.clubId) {
    query = query.eq("clubId", "none");
  }

  const { data: tournaments } = await query;
  if (!tournaments?.length) return [];

  const clubIds = [...new Set(tournaments.map((t: { clubId: string }) => t.clubId))];
  const { data: clubs } = await supabase
    .from("Club")
    .select("id, name")
    .in("id", clubIds);
  const clubMap = Object.fromEntries(
    (clubs ?? []).map((c: { id: string; name: string }) => [c.id, { name: c.name }])
  );

  return tournaments.map(
    (t: {
      id: string;
      name: string;
      slug: string;
      date: string;
      clubId: string;
      status: string;
    }) => ({
      ...t,
      club: clubMap[t.clubId] ?? { name: "" },
    })
  ) as TournamentWithClub[];
}

/** Próximos torneos (fecha >= hoy), ordenados por fecha ascendente. */
export async function getUpcomingTournaments(
  limit = 6
): Promise<TournamentWithClub[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const today = new Date().toISOString().slice(0, 10);

  const { data: tournaments } = await supabase
    .from("Tournament")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(limit);

  if (!tournaments?.length) return [];

  const clubIds = [
    ...new Set(tournaments.map((t: { clubId: string }) => t.clubId)),
  ];
  const { data: clubs } = await supabase
    .from("Club")
    .select("id, name")
    .in("id", clubIds);
  const clubMap = Object.fromEntries(
    (clubs ?? []).map((c: { id: string; name: string }) => [
      c.id,
      { name: c.name },
    ])
  );

  return tournaments.map(
    (t: {
      id: string;
      name: string;
      slug: string;
      date: string;
      clubId: string;
      status: string;
    }) => ({
      ...t,
      club: clubMap[t.clubId] ?? { name: "" },
    })
  ) as TournamentWithClub[];
}

export async function getTournamentById(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: t } = await supabase.from("Tournament").select("*").eq("id", id).single();
  if (!t) return null;

  const { data: club } = await supabase.from("Club").select("name").eq("id", t.clubId).single();

  const { data: entries } = await supabase
    .from("TournamentEntry")
    .select("*")
    .eq("tournamentId", id);

  if (!entries?.length) {
    return { ...t, club: club ? { name: club.name } : { name: "" }, entries: [] };
  }

  const playerIds = [...new Set(entries.map((e: { playerId: string }) => e.playerId))];
  const entryIds = entries.map((e: { id: string }) => e.id);

  const [{ data: players }, { data: scorecards }] = await Promise.all([
    supabase.from("Player").select("*").in("id", playerIds),
    supabase.from("Scorecard").select("*").in("entryId", entryIds),
  ]);

  const playerMap = Object.fromEntries((players ?? []).map((p) => [p.id, p]));
  const scorecardMap = Object.fromEntries(
    (scorecards ?? []).map((s: { entryId: string }) => [s.entryId, s])
  );

  const clubIds = [...new Set((players ?? []).map((p: { clubId: string }) => p.clubId))];
  const { data: clubs } = await supabase.from("Club").select("id, name").in("id", clubIds);
  const clubMap = Object.fromEntries(
    (clubs ?? []).map((c: { id: string; name: string }) => [c.id, { name: c.name }])
  );

  const entriesFull = entries
    .map((e) => {
      const player = playerMap[e.playerId];
      const scorecard = scorecardMap[e.id];
      return {
        ...e,
        player: player ? { ...player, club: clubMap[player.clubId] ?? { name: "" } } : null,
        scorecard: scorecard ?? null,
      };
    })
    .sort((a, b) =>
      (a.player?.lastName ?? "").localeCompare(b.player?.lastName ?? "")
    );

  return {
    ...t,
    club: club ? { name: club.name } : { name: "" },
    entries: entriesFull,
  };
}

export async function getTournamentBySlug(slug: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: t } = await supabase.from("Tournament").select("*").eq("slug", slug).single();
  if (!t) return null;

  const { data: club } = await supabase.from("Club").select("name").eq("id", t.clubId).single();

  const { data: entries } = await supabase
    .from("TournamentEntry")
    .select("*")
    .eq("tournamentId", t.id);

  if (!entries?.length) {
    return { ...t, club: club ? { name: club.name } : { name: "" }, entries: [] };
  }

  const playerIds = [...new Set(entries.map((e: { playerId: string }) => e.playerId))];
  const entryIds = entries.map((e: { id: string }) => e.id);

  const [{ data: players }, { data: scorecards }] = await Promise.all([
    supabase.from("Player").select("*").in("id", playerIds),
    supabase.from("Scorecard").select("*").in("entryId", entryIds),
  ]);

  const playerMap = Object.fromEntries((players ?? []).map((p) => [p.id, p]));
  const scorecardMap = Object.fromEntries(
    (scorecards ?? []).map((s: { entryId: string }) => [s.entryId, s])
  );

  const clubIds = [...new Set((players ?? []).map((p: { clubId: string }) => p.clubId))];
  const { data: clubs } = await supabase.from("Club").select("id, name").in("id", clubIds);
  const clubMap = Object.fromEntries(
    (clubs ?? []).map((c: { id: string; name: string }) => [c.id, { name: c.name }])
  );

  const entriesFull = entries.map((e) => {
    const player = playerMap[e.playerId];
    const scorecard = scorecardMap[e.id];
    return {
      ...e,
      player: player ? { ...player, club: clubMap[player.clubId] ?? { name: "" } } : null,
      scorecard: scorecard ?? null,
    };
  });

  const published = entriesFull.filter((e) => e.scorecard?.status === "PUBLISHED");
  const sorted = [...published].sort((a, b) => {
    const ga = a.scorecard?.gross ?? 999;
    const gb = b.scorecard?.gross ?? 999;
    if (ga !== gb) return ga - gb;
    return (a.scorecard?.net ?? 999) - (b.scorecard?.net ?? 999);
  });
  const entriesWithPosition = sorted.map((e, i) => ({ ...e, position: i + 1 }));

  return {
    ...t,
    club: club ? { name: club.name } : { name: "" },
    entries: entriesWithPosition,
  };
}

export async function getClubs() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data } = await supabase
    .from("Club")
    .select("*")
    .order("name");

  return data ?? [];
}

/** Lista de clubes con cantidad de jugadores afiliados. */
export async function getClubsWithCounts(): Promise<
  Array<{
    id: string;
    code: string | null;
    name: string;
    slug: string;
    address: string | null;
    phone: string | null;
    playersCount: number;
  }>
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const [{ data: clubs }, { data: players }] = await Promise.all([
    supabase
      .from("Club")
      .select("id,code,name,slug,address,phone")
      .order("code", { ascending: true, nullsFirst: false }),
    supabase.from("Player").select("clubId"),
  ]);

  const counts: Record<string, number> = {};
  for (const p of (players ?? []) as { clubId: string }[]) {
    counts[p.clubId] = (counts[p.clubId] ?? 0) + 1;
  }

  return ((clubs ?? []) as Array<{
    id: string;
    code: string | null;
    name: string;
    slug: string;
    address: string | null;
    phone: string | null;
  }>).map((c) => ({
    ...c,
    playersCount: counts[c.id] ?? 0,
  }));
}

export async function getClubBySlug(slug: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("Club")
    .select("id,code,name,slug,address,phone")
    .eq("slug", slug)
    .maybeSingle();

  return data as {
    id: string;
    code: string | null;
    name: string;
    slug: string;
    address: string | null;
    phone: string | null;
  } | null;
}

/** Jugadores de un club para vista pública (sin datos sensibles). */
export async function getPublicPlayersByClubId(clubId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("Player")
    .select("id,firstName,lastName,handicap,handicapIndex,category")
    .eq("clubId", clubId)
    .order("lastName", { ascending: true })
    .order("firstName", { ascending: true });

  if (error) {
    console.error("[getPublicPlayersByClubId]", error.message);
    return [];
  }

  return (data ?? []) as Array<{
    id: string;
    firstName: string;
    lastName: string;
    handicap: number;
    handicapIndex: number | null;
    category: string | null;
  }>;
}

export async function getNews() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data } = await supabase
    .from("News")
    .select("*")
    .eq("published", true)
    .order("publishedAt", { ascending: false })
    .limit(20);

  return data ?? [];
}

/** Listado completo de noticias publicadas para gestión (prensa). */
export async function getPublishedNewsForGestion(limit = 500) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("News")
    .select("id,title,slug,publishedAt,createdAt")
    .eq("published", true)
    .order("publishedAt", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getPublishedNewsForGestion]", error.message);
    return [];
  }

  return (data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    publishedAt: string | null;
    createdAt: string;
  }>;
}

export async function getNewsBySlug(slug: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("News")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  return data;
}

export async function getRankingEntries(year: number) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: entries } = await supabase
    .from("RankingEntry")
    .select("*, Player(*)")
    .eq("year", year)
    .order("points", { ascending: false })
    .limit(50);

  if (!entries?.length) return [];

  const clubIds = [
    ...new Set(
      entries
        .map((e) => e.Player?.clubId)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ];
  const { data: clubs } = clubIds.length
    ? await supabase.from("Club").select("id, name").in("id", clubIds)
    : { data: [] };
  const clubMap = Object.fromEntries(
    (clubs ?? []).map((c: { id: string; name: string }) => [c.id, { name: c.name }])
  );

  return entries.map((e) => ({
    ...e,
    player: e.Player
      ? { ...e.Player, club: clubMap[e.Player.clubId] ?? { name: "" } }
      : null,
  }));
}

/** Fila de ranking federativo por handicap (dato dinámico en DB). */
export type HandicapRankingRow = {
  position: number;
  playerId: string;
  firstName: string;
  lastName: string;
  clubName: string;
  handicapLabel: string;
};

export type HandicapRankingCategoryBlock = {
  groupKey: string;
  slug: string;
  label: string;
  rows: HandicapRankingRow[];
};

type PlayerRankingRow = {
  id: string;
  firstName: string;
  lastName: string;
  handicap: number;
  handicapIndex: number | null;
  category: string | null;
  clubId: string;
};

async function fetchAllPlayersForHandicapRanking(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>
): Promise<PlayerRankingRow[]> {
  const pageSize = 1000;
  const all: PlayerRankingRow[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("Player")
      .select("id,firstName,lastName,handicap,handicapIndex,category,clubId")
      .range(from, from + pageSize - 1);
    if (error) {
      console.error("[getHandicapRankingsByCategory]", error.message);
      break;
    }
    const chunk = (data ?? []) as PlayerRankingRow[];
    all.push(...chunk);
    if (chunk.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

/**
 * Rankings por categoría (`Player.category`), ordenados por handicap ascendente
 * (menor = mejor). Excluye jugadores sin handicap válido o con handicap ≤ 0.
 * Los datos se leen en cada request (handicaps actualizados en DB).
 */
export async function getHandicapRankingsByCategory(): Promise<HandicapRankingCategoryBlock[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const players = await fetchAllPlayersForHandicapRanking(supabase);
  if (!players.length) return [];

  const clubIds = [...new Set(players.map((p) => p.clubId).filter(Boolean))];
  const { data: clubs } = clubIds.length
    ? await supabase.from("Club").select("id, name").in("id", clubIds)
    : { data: [] };
  const clubMap = Object.fromEntries(
    (clubs ?? []).map((c: { id: string; name: string }) => [c.id, c.name as string])
  );

  const byKey = new Map<
    string,
    { label: string; list: (PlayerRankingRow & { sort: number; hLabel: string })[] }
  >();

  for (const p of players) {
    const sort = handicapSortValue(p);
    // Solo entran jugadores con handicap efectivo finito y estrictamente > 0.
    if (!Number.isFinite(sort) || sort <= 0) continue;

    const gKey = keyForRankingCategory(p.category);
    const label = labelForRankingCategory(p.category);
    const hLabel = formatHandicapRankingCell(p);
    if (!byKey.has(gKey)) {
      byKey.set(gKey, { label, list: [] });
    }
    byKey.get(gKey)!.list.push({ ...p, sort, hLabel });
  }

  function tiebreak(
    a: PlayerRankingRow,
    b: PlayerRankingRow
  ): number {
    const ln = a.lastName.localeCompare(b.lastName, "es", { sensitivity: "base" });
    if (ln !== 0) return ln;
    return a.firstName.localeCompare(b.firstName, "es", { sensitivity: "base" });
  }

  const blocks: HandicapRankingCategoryBlock[] = [];

  for (const [groupKey, { label, list }] of byKey) {
    const sorted = [...list].sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort;
      return tiebreak(a, b);
    });

    const rows: HandicapRankingRow[] = sorted.map((row, i) => ({
      position: i + 1,
      playerId: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      clubName: clubMap[row.clubId] ?? "",
      handicapLabel: row.hLabel,
    }));

    blocks.push({
      groupKey,
      slug: slugifyRankingCategoryKey(groupKey),
      label,
      rows,
    });
  }

  blocks.sort((a, b) => {
    if (a.groupKey === "__sin_categoria__") return 1;
    if (b.groupKey === "__sin_categoria__") return -1;
    return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
  });

  return blocks;
}

export async function getTournamentEntry(entryId: string, tournamentId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: entry } = await supabase
    .from("TournamentEntry")
    .select("*")
    .eq("id", entryId)
    .eq("tournamentId", tournamentId)
    .single();

  if (!entry) return null;

  const { data: player } = await supabase.from("Player").select("*").eq("id", entry.playerId).single();
  const { data: scorecard } = await supabase.from("Scorecard").select("*").eq("entryId", entryId).single();

  let club = { name: "" };
  if (player?.clubId) {
    const { data: c } = await supabase.from("Club").select("name").eq("id", player.clubId).single();
    club = c ? { name: c.name } : { name: "" };
  }

  return {
    ...entry,
    player: player ? { ...player, club } : null,
    scorecard: scorecard ?? null,
  };
}

/** Torneos públicos para histórico (todos los clubes). */
export async function getPublicTournamentsHistoric(limit = 400) {
  return getTournaments({ isAdmin: true, limit });
}

/** { tournamentId: { count, thumbUrl } } para APPROVED con torneo asociado. */
export async function getTournamentApprovedPhotoStats() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return {} as Record<string, { count: number; thumbUrl: string }>;

  const { data } = await supabase
    .from("Photo")
    .select("tournamentId, url")
    .eq("status", "APPROVED")
    .not("tournamentId", "is", null);

  const stats: Record<string, { count: number; thumbUrl: string }> = {};
  for (const row of data ?? []) {
    const tid = (row as { tournamentId: string | null }).tournamentId;
    if (!tid) continue;
    if (!stats[tid]) {
      stats[tid] = { count: 0, thumbUrl: (row as { url: string }).url };
    }
    stats[tid].count += 1;
  }
  return stats;
}

/** Galería pública de un torneo (solo aprobadas). */
export async function getApprovedPhotosForTournament(tournamentId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data } = await supabase
    .from("Photo")
    .select("*")
    .eq("status", "APPROVED")
    .eq("tournamentId", tournamentId)
    .order("featured", { ascending: false })
    .order("createdAt", { ascending: false });

  return data ?? [];
}

/** Pendientes de moderación, con datos del torneo si aplica. */
export async function getPendingPhotos() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: photos } = await supabase
    .from("Photo")
    .select("*")
    .eq("status", "PENDING")
    .order("createdAt", { ascending: false });

  if (!photos?.length) return [];

  const tids = [
    ...new Set(
      photos
        .map((p: { tournamentId: string | null }) => p.tournamentId)
        .filter((id): id is string => !!id)
    ),
  ];

  if (tids.length === 0) {
    return photos.map((p) => ({ ...p, tournament: null }));
  }

  const { data: tournaments } = await supabase
    .from("Tournament")
    .select("id, name, slug")
    .in("id", tids);

  const tMap = Object.fromEntries(
    (tournaments ?? []).map((t: { id: string; name: string; slug: string }) => [
      t.id,
      { name: t.name, slug: t.slug },
    ])
  );

  return photos.map((p: { tournamentId: string | null }) => ({
    ...p,
    tournament: p.tournamentId ? tMap[p.tournamentId] ?? null : null,
  }));
}

/** Fotos aprobadas para la galería pública: destacadas primero, luego por fecha. */
export async function getApprovedPhotos(limit = 60) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data } = await supabase
    .from("Photo")
    .select("*")
    .eq("status", "APPROVED")
    .order("featured", { ascending: false })
    .order("createdAt", { ascending: false })
    .limit(limit);

  return data ?? [];
}

/** Todas las aprobadas para el panel de prensa (gestión de destacadas). */
export async function getApprovedPhotosForPress() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data } = await supabase
    .from("Photo")
    .select("*")
    .eq("status", "APPROVED")
    .order("featured", { ascending: false })
    .order("createdAt", { ascending: false });

  return data ?? [];
}

export async function getPendingExpenses() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: expenses } = await supabase
    .from("Expense")
    .select("*")
    .eq("status", "PENDING")
    .order("createdAt", { ascending: false });

  if (!expenses?.length) return [];

  const clubIds = [...new Set(expenses.map((e: { clubId: string }) => e.clubId))];
  const { data: clubs } = await supabase.from("Club").select("id, name").in("id", clubIds);
  const clubMap = Object.fromEntries(
    (clubs ?? []).map((c: { id: string; name: string }) => [c.id, { name: c.name }])
  );

  return expenses.map((e) => ({
    ...e,
    club: clubMap[e.clubId] ?? { name: "" },
  }));
}

export async function getPlayerById(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  // Whitelist explícita: NUNCA seleccionar emailEnc/phoneEnc/dniEnc.
  const { data: p } = await supabase
    .from("Player")
    .select(
      "id,matricula,firstName,lastName,handicap,handicapIndex,handicapCourse,califIda,slopeIda,califVta,slopeVta,califTotal,slopeTotal,category,birthYear,age,gender,clubId,createdAt,updatedAt"
    )
    .eq("id", id)
    .single();
  if (!p) return null;

  const { data: club } = await supabase.from("Club").select("name").eq("id", p.clubId).single();
  return { ...p, club: club ? { name: club.name } : { name: "" } };
}
