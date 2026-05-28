import { getSupabaseAdmin } from "@/lib/supabase";
import { decryptSensitive } from "@/lib/sensitive-crypto";
import {
  canonicalDniForLookup,
  hashDniForLookup,
  normalizeDni,
} from "@/lib/empadronamiento-menores/dni";
import { EMPADRONAMIENTO_SEASON_YEAR } from "@/lib/empadronamiento-menores/constants";
import { matchEnrollmentClub } from "@/lib/empadronamiento-menores/club-match";
import { isYouthPlayerCategory } from "@/lib/youth-categories";

export type PadronMenorLookup = {
  /** Id en YouthEnrollment o Player según origen del padrón. */
  enrollmentId: string;
  source: "youth_enrollment" | "player";
  lastName: string;
  firstName: string;
  gender: "Varón" | "Mujer";
  birthDate: string;
  clubName: string;
  hasHandicap: boolean;
  matricula: string | null;
};

function normalizeCategory(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Jugador del padrón menores (tabla Player / planilla FGL). */
function isPadronMenorFromPlayer(category: string | null, birthYear: number): boolean {
  if (isYouthPlayerCategory(category)) return true;
  const k = normalizeCategory(category);
  if (!k || k === "—" || k === "-") {
    return birthYear >= 2004 && birthYear <= 2019;
  }
  if (k.includes("juvenil") || k.includes("prejuvenil") || k.includes("pre juvenil")) {
    return true;
  }
  if (
    k.includes("albatros") ||
    k.includes("aguila") ||
    k.includes("birdie") ||
    k.includes("principiante")
  ) {
    return true;
  }
  if (k.includes("sub 23") || k.includes("sub23")) return true;
  return false;
}

function mapGender(g: string): "Varón" | "Mujer" {
  const v = g.trim().toUpperCase();
  if (v === "F" || v === "MUJER") return "Mujer";
  return "Varón";
}

function formatBirthDate(birthDate: string | null, birthYear: number): string {
  if (birthDate) {
    const s = String(birthDate).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  }
  if (birthYear > 1900 && birthYear < 2100) {
    return `${birthYear}-06-15`;
  }
  return "";
}

type PlayerRow = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string | null;
  birthYear: number;
  category: string | null;
  matricula: string | null;
  handicap: number;
  club: { name: string } | { name: string }[] | null;
};

function mapPlayerRowToLookup(
  player: PlayerRow,
  clubs: { id: string; name: string; code: string | null }[]
): PadronMenorLookup | null {
  const birthDate = formatBirthDate(player.birthDate, player.birthYear);
  if (!birthDate) return null;

  const clubRaw = player.club;
  const clubFromDb = Array.isArray(clubRaw)
    ? clubRaw[0]?.name ?? ""
    : clubRaw?.name ?? "";

  const clubMatch = matchEnrollmentClub(clubFromDb, clubs);
  const clubName = (clubMatch?.name ?? clubFromDb).trim().toUpperCase();

  return {
    enrollmentId: player.id,
    source: "player",
    lastName: player.lastName,
    firstName: player.firstName,
    gender: mapGender(player.gender),
    birthDate,
    clubName,
    hasHandicap: Boolean(player.matricula?.trim()) || player.handicap > 0,
    matricula: player.matricula,
  };
}

async function lookupInYouthEnrollment(dniHash: string): Promise<PadronMenorLookup | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !dniHash) return null;

  const { data, error } = await supabase
    .from("YouthEnrollment")
    .select(
      "id,lastName,firstName,gender,birthDate,clubName,hasHandicap,matricula"
    )
    .eq("seasonYear", EMPADRONAMIENTO_SEASON_YEAR)
    .eq("dniHash", dniHash)
    .maybeSingle();

  if (error) {
    console.error("[lookupInYouthEnrollment]", error.message);
    return null;
  }
  if (!data) return null;

  const birthDate = formatBirthDate(data.birthDate, 0);
  const gender = data.gender === "Mujer" ? "Mujer" : "Varón";

  return {
    enrollmentId: data.id,
    source: "youth_enrollment",
    lastName: data.lastName,
    firstName: data.firstName,
    gender,
    birthDate,
    clubName: data.clubName,
    hasHandicap: Boolean(data.hasHandicap),
    matricula: data.matricula,
  };
}

const PLAYER_SELECT =
  "id,firstName,lastName,gender,birthDate,birthYear,category,matricula,handicap,dniEnc,dniHash,club:Club(name)";

async function lookupInPlayerPadron(dniHash: string, dniCanonical: string): Promise<PadronMenorLookup | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: clubRows } = await supabase.from("Club").select("id,name,code");
  const clubs = (clubRows ?? []).map((c: { id: string; name: string; code: string | null }) => ({
    id: c.id,
    name: c.name,
    code: c.code,
  }));

  if (dniHash) {
    const { data: byHash, error: hashError } = await supabase
      .from("Player")
      .select(PLAYER_SELECT)
      .eq("dniHash", dniHash)
      .maybeSingle();

    if (hashError) {
      console.error("[lookupInPlayerPadron] dniHash", hashError.message);
    } else if (byHash) {
      const mapped = mapPlayerRowToLookup(byHash as PlayerRow, clubs);
      if (mapped) return mapped;
    }
  }

  const { data, error } = await supabase
    .from("Player")
    .select(PLAYER_SELECT)
    .not("dniEnc", "is", null)
    .is("dniHash", null);

  if (error) {
    console.error("[lookupInPlayerPadron]", error.message);
    return null;
  }

  for (const row of data ?? []) {
    const player = row as PlayerRow & { dniEnc: string };

    if (!isPadronMenorFromPlayer(player.category, player.birthYear)) continue;

    let decrypted: string | null = null;
    try {
      decrypted = decryptSensitive(player.dniEnc);
    } catch (e) {
      console.error("[lookupInPlayerPadron] decrypt", player.id, e);
      continue;
    }
    if (!decrypted || canonicalDniForLookup(decrypted) !== dniCanonical) continue;

    const mapped = mapPlayerRowToLookup(player, clubs);
    if (mapped) return mapped;
  }

  return null;
}

/** Busca jugador empadronado por DNI (formulario web o padrón Player importado). */
export async function lookupPadronMenorByDni(
  dni: string
): Promise<{ found: true; player: PadronMenorLookup } | { found: false }> {
  const dniCanonical = canonicalDniForLookup(dni);
  if (dniCanonical.length < 7 && normalizeDni(dni).length < 7) return { found: false };

  const dniHash = hashDniForLookup(dniCanonical);

  const fromEnrollment = await lookupInYouthEnrollment(dniHash);
  if (fromEnrollment) {
    return { found: true, player: fromEnrollment };
  }

  const fromPlayer = await lookupInPlayerPadron(dniHash, dniCanonical);
  if (fromPlayer) {
    return { found: true, player: fromPlayer };
  }

  return { found: false };
}
