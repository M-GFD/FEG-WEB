import { prisma } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

export type SearchResultType =
  | "news"
  | "tournament"
  | "club"
  | "player"
  | "page";

export type SiteSearchHit = {
  type: SearchResultType;
  title: string;
  href: string;
  description?: string;
  /**
   * Metadata segura asociada al resultado.
   * IMPORTANTE: nunca debe incluir datos sensibles (correo, DNI, teléfono).
   */
  meta?: {
    handicap?: number | null;
    club?: string | null;
    category?: string | null;
  };
};

const PER_TYPE = 10;
const MAX_QUERY = 80;

type StaticPage = {
  titleKey: string;
  href: string;
  keywords: string[];
};

const STATIC_PAGES: StaticPage[] = [
  {
    titleKey: "aboutUs",
    href: "/institucional",
    keywords: ["nosotros", "institucional", "federación", "misión", "visión", "objetivos", "fe"],
  },
  {
    titleKey: "directory",
    href: "/institucional/directorio",
    keywords: ["directorio", "presidente", "vice", "tesorería", "secretario", "prensa", "comercial", "autoridades"],
  },
  {
    titleKey: "regulations",
    href: "/institucional/reglamentos",
    keywords: ["reglamentos", "reglamento", "normativa", "federación", "2026"],
  },
  {
    titleKey: "regulationsMinors",
    href: "/menores/reglamento",
    keywords: ["reglamento", "menores", "prejuveniles", "juveniles", "junior", "2026"],
  },
  {
    titleKey: "regulationsPreJuveniles",
    href: "/institucional/reglamentos/pre-juveniles",
    keywords: ["reglamento", "prejuveniles", "juveniles", "pre y juveniles", "menores", "2026"],
  },
  {
    titleKey: "regulationsJunior",
    href: "/institucional/reglamentos/junior",
    keywords: ["reglamento", "junior", "menores", "2026"],
  },
  {
    titleKey: "regulationsMayores",
    href: "/institucional/reglamentos/mayores",
    keywords: ["reglamento", "mayores", "senior", "damas", "2026"],
  },
  {
    titleKey: "regulationsRanking",
    href: "/institucional/reglamento",
    keywords: ["reglamento", "ranking", "juveniles", "prejuveniles", "cupos", "2026", "lineamientos"],
  },
  {
    titleKey: "regulationsVideos",
    href: "/institucional/reglamento/videos",
    keywords: ["videos", "explicativos", "reglamento", "tutorial", "juveniles", "prejuveniles"],
  },
  {
    titleKey: "rankings",
    href: "/ranking",
    keywords: ["ranking", "rankings", "puntos", "tabla", "posiciones"],
  },
  {
    titleKey: "news",
    href: "/noticias",
    keywords: ["noticias", "actualidad", "prensa", "novedades"],
  },
  {
    titleKey: "calendar",
    href: "/calendario",
    keywords: ["calendario", "próximos torneos", "proximos torneos", "agenda"],
  },
  {
    titleKey: "tournaments",
    href: "/torneos",
    keywords: ["torneos", "histórico", "fechas", "competencias", "galería", "galeria", "fotos", "imágenes"],
  },
  {
    titleKey: "clubs",
    href: "/clubes",
    keywords: ["clubes", "club", "red federativa", "socios"],
  },
  {
    titleKey: "enrollmentMinors",
    href: "/empadronamiento-menores",
    keywords: [
      "empadronamiento",
      "empadronar",
      "empadronarse",
      "padron",
      "padrón",
      "menores",
      "juveniles",
      "formulario",
      "temporada",
      "feg",
      "matricula",
      "matrícula",
    ],
  },
  {
    titleKey: "signupMinors",
    href: "/inscripcion-torneos-menores",
    keywords: [
      "inscripcion",
      "inscripción",
      "inscribirse",
      "inscribir",
      "torneo",
      "torneos",
      "menores",
      "juveniles",
    ],
  },
];

export type SearchLabels = {
  labelForType: (type: SearchResultType) => string;
  staticPageTitle: (key: string) => string;
  staticSectionDescription: string;
  clubListFallback: string;
  clubCode: (code: string) => string;
  playerClub: (club: string) => string;
  playerHandicap: (handicap: string) => string;
  playerDefault: string;
};

type SearchPageTranslator = (
  key: string,
  values?: Record<string, string | number | Date>
) => string;

export function getSearchLabels(t: SearchPageTranslator): SearchLabels {
  return {
    labelForType: (type) => t(`types.${type}`),
    staticPageTitle: (key) => t(`staticPages.${key}`),
    staticSectionDescription: t("staticSectionDescription"),
    clubListFallback: t("clubListFallback"),
    clubCode: (code) => t("clubCode", { code }),
    playerClub: (club) => t("playerClub", { club }),
    playerHandicap: (handicap) => t("playerHandicap", { handicap }),
    playerDefault: t("playerDefault"),
  };
}

function normalizeQuery(raw: string): string {
  return raw
    .trim()
    .slice(0, MAX_QUERY)
    .replace(/\s+/g, " ")
    .replace(/[%_\\,]/g, " ");
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function matchStaticPages(q: string, labels: SearchLabels): SiteSearchHit[] {
  const lower = normalizeForMatch(q);
  if (!lower) return [];

  const hits: SiteSearchHit[] = [];
  for (const p of STATIC_PAGES) {
    const title = labels.staticPageTitle(p.titleKey);
    const titleNorm = normalizeForMatch(title);
    const match =
      titleNorm.includes(lower) ||
      lower.includes(titleNorm) ||
      p.keywords.some((k) => {
        const kn = normalizeForMatch(k);
        return lower.includes(kn) || kn.includes(lower);
      });
    if (match) {
      hits.push({
        type: "page",
        title,
        href: p.href,
        description: labels.staticSectionDescription,
      });
    }
  }
  return hits;
}

/**
 * Mejor handicap “mostrable”: prefiere el index oficial (Float),
 * sino el handicap entero histórico.
 */
function bestHandicap(p: {
  handicap: number | null;
  handicapIndex: number | null | undefined;
}): number | null {
  if (typeof p.handicapIndex === "number") return p.handicapIndex;
  if (typeof p.handicap === "number" && p.handicap !== 0) return p.handicap;
  return null;
}

function formatHandicap(h: number | null): string | null {
  if (h == null) return null;
  return Number.isInteger(h) ? `${h}` : h.toFixed(1);
}

async function searchViaSupabase(q: string, labels: SearchLabels): Promise<SiteSearchHit[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const pattern = `%${q}%`;

  const [newsRes, tourRes, clubRes, playerRes, clubsByNameRes] = await Promise.all([
    supabase
      .from("News")
      .select("id,title,slug,excerpt")
      .eq("published", true)
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern},slug.ilike.${pattern}`)
      .limit(PER_TYPE),
    supabase
      .from("Tournament")
      .select("id,name,slug,date,status")
      .or(`name.ilike.${pattern},slug.ilike.${pattern}`)
      .order("date", { ascending: false })
      .limit(PER_TYPE),
    supabase
      .from("Club")
      .select("id,name,slug,address,phone,code")
      .or(`name.ilike.${pattern},address.ilike.${pattern},phone.ilike.${pattern}`)
      .order("name")
      .limit(PER_TYPE),
    // SOLO campos no sensibles. Nunca emailEnc/phoneEnc/dniEnc.
    supabase
      .from("Player")
      .select("id,firstName,lastName,handicap,handicapIndex,clubId,category")
      .or(`firstName.ilike.${pattern},lastName.ilike.${pattern}`)
      .order("lastName")
      .limit(PER_TYPE),
    // Para soportar “buscar jugadores por club”: traemos clubes que matcheen el query y luego
    // enlistamos hasta PER_TYPE jugadores por club coincidente (en una segunda consulta).
    supabase
      .from("Club")
      .select("id,name")
      .ilike("name", pattern)
      .limit(3),
  ]);

  const hits: SiteSearchHit[] = [];

  for (const row of newsRes.data ?? []) {
    const r = row as { title: string; slug: string; excerpt: string | null };
    hits.push({
      type: "news",
      title: r.title,
      href: `/noticias/${r.slug}`,
      description: r.excerpt ?? undefined,
    });
  }

  for (const row of tourRes.data ?? []) {
    const r = row as { name: string; slug: string; date: string; status: string };
    const d = r.date ? new Date(r.date).toLocaleDateString("es-AR") : "";
    hits.push({
      type: "tournament",
      title: r.name,
      href: `/torneos/${r.slug}`,
      description: [d, r.status].filter(Boolean).join(" · "),
    });
  }

  const clubRows = clubRes.data ?? [];
  for (const row of clubRows) {
    const r = row as { name: string; address: string | null; phone: string | null; code: string | null };
    hits.push({
      type: "club",
      title: r.name,
      href: "/clubes",
      description: [r.code ? labels.clubCode(r.code) : null, r.address, r.phone]
        .filter(Boolean)
        .join(" · ") || labels.clubListFallback,
    });
  }

  // Mapa global id→nombre para enriquecer los hits de jugador.
  const allPlayerRows = (playerRes.data ?? []) as Array<{
    id: string;
    firstName: string;
    lastName: string;
    handicap: number;
    handicapIndex: number | null;
    clubId: string;
    category: string | null;
  }>;

  // Búsqueda adicional: jugadores cuyo CLUB matchea el query.
  const matchClubs = (clubsByNameRes.data ?? []) as Array<{ id: string; name: string }>;
  let playersByClubMatch: typeof allPlayerRows = [];
  if (matchClubs.length > 0) {
    const ids = matchClubs.map((c) => c.id);
    const { data } = await supabase
      .from("Player")
      .select("id,firstName,lastName,handicap,handicapIndex,clubId,category")
      .in("clubId", ids)
      .order("lastName")
      .limit(PER_TYPE * 2);
    playersByClubMatch = (data ?? []) as typeof allPlayerRows;
  }

  const merged = [...allPlayerRows, ...playersByClubMatch];
  const seenPlayerIds = new Set<string>();
  const playerRows = merged.filter((p) => {
    if (seenPlayerIds.has(p.id)) return false;
    seenPlayerIds.add(p.id);
    return true;
  });

  // Resolución de nombres de club (incluyendo los de la búsqueda directa por jugador).
  const pClubIds = [...new Set(playerRows.map((p) => p.clubId).filter(Boolean))];
  let pClubNames: Record<string, string> = {};
  if (pClubIds.length) {
    const { data: pclubs } = await supabase.from("Club").select("id,name").in("id", pClubIds);
    pClubNames = Object.fromEntries(
      (pclubs ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
    );
  }

  for (const r of playerRows) {
    const clubName = pClubNames[r.clubId] ?? null;
    const h = bestHandicap({ handicap: r.handicap, handicapIndex: r.handicapIndex });
    const hStr = formatHandicap(h);
    hits.push({
      type: "player",
      title: `${r.firstName} ${r.lastName}`.trim(),
      href: `/jugadores/${r.id}`,
      description: [clubName ? labels.playerClub(clubName) : null, hStr ? labels.playerHandicap(hStr) : null]
        .filter(Boolean)
        .join(" · ") || labels.playerDefault,
      meta: {
        handicap: h,
        club: clubName,
        category: r.category,
      },
    });
  }

  return hits;
}

async function searchViaPrisma(q: string, labels: SearchLabels): Promise<SiteSearchHit[]> {
  const hits: SiteSearchHit[] = [];

  const [newsList, tours, clubs, players, clubMatchPlayers] = await Promise.all([
    prisma.news
      .findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { title: true, slug: true, excerpt: true },
        take: PER_TYPE,
      })
      .catch(() => []),
    prisma.tournament
      .findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { name: true, slug: true, date: true, status: true },
        orderBy: { date: "desc" },
        take: PER_TYPE,
      })
      .catch(() => []),
    prisma.club
      .findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { name: true, code: true, address: true, phone: true },
        orderBy: { name: "asc" },
        take: PER_TYPE,
      })
      .catch(() => []),
    prisma.player
      .findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          handicap: true,
          handicapIndex: true,
          category: true,
          club: { select: { name: true } },
        },
        take: PER_TYPE,
      })
      .catch(() => []),
    prisma.player
      .findMany({
        where: {
          club: { name: { contains: q, mode: "insensitive" } },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          handicap: true,
          handicapIndex: true,
          category: true,
          club: { select: { name: true } },
        },
        take: PER_TYPE,
      })
      .catch(() => []),
  ]);

  for (const n of newsList) {
    hits.push({
      type: "news",
      title: n.title,
      href: `/noticias/${n.slug}`,
      description: n.excerpt ?? undefined,
    });
  }
  for (const t of tours) {
    hits.push({
      type: "tournament",
      title: t.name,
      href: `/torneos/${t.slug}`,
      description: `${t.date.toLocaleDateString("es-AR")} · ${t.status}`,
    });
  }
  for (const c of clubs) {
    hits.push({
      type: "club",
      title: c.name,
      href: "/clubes",
      description: [c.code ? labels.clubCode(c.code) : null, c.address, c.phone]
        .filter(Boolean)
        .join(" · ") || labels.clubListFallback,
    });
  }

  const seen = new Set<string>();
  for (const p of [...players, ...clubMatchPlayers]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const h = bestHandicap({ handicap: p.handicap, handicapIndex: p.handicapIndex });
    const hStr = formatHandicap(h);
    hits.push({
      type: "player",
      title: `${p.firstName} ${p.lastName}`.trim(),
      href: `/jugadores/${p.id}`,
      description: [p.club?.name ? labels.playerClub(p.club.name) : null, hStr ? labels.playerHandicap(hStr) : null]
        .filter(Boolean)
        .join(" · ") || labels.playerDefault,
      meta: {
        handicap: h,
        club: p.club?.name ?? null,
        category: p.category ?? null,
      },
    });
  }

  return hits;
}

function typeOrder(t: SearchResultType): number {
  const order: SearchResultType[] = ["page", "news", "tournament", "club", "player"];
  return order.indexOf(t);
}

function dedupeAndSort(hits: SiteSearchHit[]): SiteSearchHit[] {
  const seen = new Set<string>();
  const out: SiteSearchHit[] = [];
  for (const h of hits) {
    const key = `${h.type}|${h.href}|${h.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
  }
  out.sort((a, b) => {
    const d = typeOrder(a.type) - typeOrder(b.type);
    if (d !== 0) return d;
    return a.title.localeCompare(b.title, "es");
  });
  return out;
}

/**
 * Búsqueda global por noticias, torneos, clubes y jugadores.
 * IMPORTANTE: NUNCA expone correo/DNI/teléfono.
 */
export async function searchSite(
  rawQuery: string,
  labels: SearchLabels
): Promise<{
  query: string;
  hits: SiteSearchHit[];
}> {
  const query = normalizeQuery(rawQuery);
  if (!query) {
    return { query: "", hits: [] };
  }

  const staticHits = matchStaticPages(query, labels);

  const dbHits =
    (await searchViaSupabase(query, labels)) ?? (await searchViaPrisma(query, labels));

  const hits = dedupeAndSort([...staticHits, ...dbHits]);
  return { query, hits };
}
