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
};

const PER_TYPE = 8;
const MAX_QUERY = 80;

type StaticPage = {
  title: string;
  href: string;
  keywords: string[];
};

const STATIC_PAGES: StaticPage[] = [
  {
    title: "Institucional",
    href: "/institucional",
    keywords: ["institucional", "federación", "misión", "visión", "objetivos", "fe"],
  },
  {
    title: "Directorio",
    href: "/institucional/directorio",
    keywords: ["directorio", "presidente", "vice", "tesorería", "secretario", "prensa", "comercial", "autoridades"],
  },
  {
    title: "Reglamento ranking juveniles y prejuveniles",
    href: "/institucional#reglamento",
    keywords: ["reglamento", "ranking", "juveniles", "prejuveniles", "cupos", "2026", "lineamientos"],
  },
  {
    title: "Rankings",
    href: "/ranking",
    keywords: ["ranking", "rankings", "puntos", "tabla", "posiciones"],
  },
  {
    title: "Noticias",
    href: "/noticias",
    keywords: ["noticias", "actualidad", "prensa", "novedades"],
  },
  {
    title: "Calendario (inicio)",
    href: "/#proximos-torneos",
    keywords: ["próximos torneos", "proximos torneos", "agenda"],
  },
  {
    title: "Torneos",
    href: "/torneos",
    keywords: ["torneos", "calendario", "histórico", "fechas", "competencias", "galería", "galeria", "fotos", "imágenes"],
  },
  {
    title: "Clubes",
    href: "/clubes",
    keywords: ["clubes", "club", "red federativa", "socios"],
  },
];

function normalizeQuery(raw: string): string {
  return raw
    .trim()
    .slice(0, MAX_QUERY)
    .replace(/\s+/g, " ")
    .replace(/[%_\\,]/g, " ");
}

function matchStaticPages(q: string): SiteSearchHit[] {
  const lower = q.toLowerCase();
  if (!lower) return [];

  const hits: SiteSearchHit[] = [];
  for (const p of STATIC_PAGES) {
    const match =
      p.title.toLowerCase().includes(lower) ||
      p.keywords.some((k) => lower.includes(k) || k.includes(lower));
    if (match) {
      hits.push({
        type: "page",
        title: p.title,
        href: p.href,
        description: "Sección del sitio",
      });
    }
  }
  return hits;
}

async function searchViaSupabase(q: string): Promise<SiteSearchHit[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const pattern = `%${q}%`;

  const [newsRes, tourRes, clubRes, playerRes] = await Promise.all([
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
      .select("id,name,slug,address,phone")
      .or(`name.ilike.${pattern},address.ilike.${pattern},phone.ilike.${pattern}`)
      .order("name")
      .limit(PER_TYPE),
    supabase
      .from("Player")
      .select("id,firstName,lastName,clubId")
      .or(`firstName.ilike.${pattern},lastName.ilike.${pattern}`)
      .limit(PER_TYPE),
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
    const r = row as { name: string; address: string | null; phone: string | null };
    hits.push({
      type: "club",
      title: r.name,
      href: "/clubes",
      description: [r.address, r.phone].filter(Boolean).join(" · ") || "Ver listado de clubes",
    });
  }

  const playerRows = playerRes.data ?? [];
  const pClubIds = [
    ...new Set(
      (playerRows as { clubId: string }[])
        .map((p) => p.clubId)
        .filter(Boolean)
    ),
  ];
  let pClubNames: Record<string, string> = {};
  if (pClubIds.length) {
    const { data: pclubs } = await supabase.from("Club").select("id,name").in("id", pClubIds);
    pClubNames = Object.fromEntries(
      (pclubs ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
    );
  }

  for (const row of playerRows) {
    const r = row as { id: string; firstName: string; lastName: string; clubId: string };
    const clubName = pClubNames[r.clubId] ?? "";
    hits.push({
      type: "player",
      title: `${r.firstName} ${r.lastName}`,
      href: `/jugadores/${r.id}`,
      description: clubName ? `Club: ${clubName}` : "Jugador matriculado",
    });
  }

  return hits;
}

async function searchViaPrisma(q: string): Promise<SiteSearchHit[]> {
  const hits: SiteSearchHit[] = [];

  const [newsList, tours, clubs, players] = await Promise.all([
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
          ],
        },
        select: { name: true, address: true, phone: true },
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
      description: [c.address, c.phone].filter(Boolean).join(" · ") || undefined,
    });
  }
  for (const p of players) {
    hits.push({
      type: "player",
      title: `${p.firstName} ${p.lastName}`,
      href: `/jugadores/${p.id}`,
      description: p.club?.name ? `Club: ${p.club.name}` : undefined,
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

const TYPE_LABEL: Record<SearchResultType, string> = {
  page: "Sitio",
  news: "Noticia",
  tournament: "Torneo",
  club: "Club",
  player: "Jugador",
};

export function labelForSearchType(t: SearchResultType): string {
  return TYPE_LABEL[t];
}

/**
 * Búsqueda global: noticias, torneos, clubes, jugadores y secciones estáticas.
 */
export async function searchSite(rawQuery: string): Promise<{
  query: string;
  hits: SiteSearchHit[];
}> {
  const query = normalizeQuery(rawQuery);
  if (!query) {
    return { query: "", hits: [] };
  }

  const staticHits = matchStaticPages(query);

  const dbHits = (await searchViaSupabase(query)) ?? (await searchViaPrisma(query));

  const hits = dedupeAndSort([...staticHits, ...dbHits]);
  return { query, hits };
}
