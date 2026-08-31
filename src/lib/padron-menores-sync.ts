import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { encryptSensitive } from "@/lib/sensitive-crypto";
import {
  canonicalDniForLookup,
  hashDniForLookup,
} from "@/lib/empadronamiento-menores/dni";

export type SyncPlayerPadronInput = {
  lastName: string;
  firstName: string;
  gender: "Varón" | "Mujer";
  birthDate: string;
  category: string;
  dni: string;
  clubId: string;
  hasHandicap: boolean;
  matricula: string | null;
  /** Handicap Index (entero o decimal). Si no viene y hasHandicap, se usa 1 como marca. */
  handicapValue?: number | null;
};

type ExistingPlayer = {
  id: string;
  matricula: string | null;
  category: string | null;
  handicap: number | null;
  handicapIndex: number | null;
  clubId: string;
  birthDate: string | null;
  birthYear: number | null;
};

const EXISTING_SELECT =
  "id,matricula,category,handicap,handicapIndex,clubId,birthDate,birthYear";

function buildFegPlayerId(
  dniCanonical: string,
  lastName: string,
  firstName: string,
  clubId: string,
  matricula: string | null
): string {
  const mat = matricula?.trim() ?? "";
  if (mat) return `player_${mat}`;
  const h = crypto
    .createHash("sha1")
    .update(`${dniCanonical}|${lastName}|${firstName}|${clubId}`)
    .digest("hex")
    .slice(0, 12);
  return `player_${clubId}_${h}`;
}

function isFederatedPlayer(row: ExistingPlayer): boolean {
  return Boolean(row.matricula && row.matricula.trim());
}

/**
 * Réplica en el padrón FEG (Player) los datos mínimos del empadronamiento web.
 * Si la persona ya existe en FEG, se reutiliza esa fila (no se crea un paralelo FGL).
 */
export async function upsertPlayerFromYouthEnrollment(
  input: SyncPlayerPadronInput
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const dniCanonical = canonicalDniForLookup(input.dni);
  if (dniCanonical.length < 7) return;

  const dniHash = hashDniForLookup(dniCanonical);
  const birthYear = parseInt(input.birthDate.slice(0, 4), 10) || 1900;
  const gender = input.gender === "Mujer" ? "F" : "M";
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const matricula = input.matricula?.trim() || null;

  const { data: byHashRows, error: hashLookupError } = await supabase
    .from("Player")
    .select(EXISTING_SELECT)
    .eq("dniHash", dniHash)
    .limit(2);

  if (hashLookupError) {
    console.error("[upsertPlayerFromYouthEnrollment]", hashLookupError.message);
    return;
  }

  let existing = (byHashRows?.[0] as ExistingPlayer | undefined) ?? null;

  if (!existing) {
    const { data: byName } = await supabase
      .from("Player")
      .select(EXISTING_SELECT)
      .eq("firstName", firstName)
      .eq("lastName", lastName)
      .eq("clubId", input.clubId)
      .maybeSingle();
    existing = (byName as ExistingPlayer | null) ?? null;
  }

  if (!existing && matricula) {
    const { data: byMatId } = await supabase
      .from("Player")
      .select(EXISTING_SELECT)
      .eq("id", `player_${matricula}`)
      .maybeSingle();
    existing = (byMatId as ExistingPlayer | null) ?? null;
  }

  const now = new Date().toISOString();

  if (existing && isFederatedPlayer(existing)) {
    const patch: Record<string, unknown> = {
      dniEnc: encryptSensitive(dniCanonical),
      dniHash,
      updatedAt: now,
    };
    if (!existing.birthDate && input.birthDate) {
      patch.birthDate = input.birthDate;
      patch.birthYear = birthYear;
    }
    const { error } = await supabase.from("Player").update(patch).eq("id", existing.id);
    if (error) {
      console.error("[upsertPlayerFromYouthEnrollment]", error.message);
    }
    return;
  }

  const handicapValue =
    input.hasHandicap &&
    typeof input.handicapValue === "number" &&
    !Number.isNaN(input.handicapValue)
      ? input.handicapValue
      : null;

  const id =
    existing?.id ??
    buildFegPlayerId(dniCanonical, lastName, firstName, input.clubId, matricula);

  const row = {
    id,
    matricula: matricula ?? existing?.matricula ?? null,
    firstName,
    lastName,
    handicap: input.hasHandicap
      ? handicapValue != null
        ? Math.round(handicapValue)
        : 1
      : (existing?.handicap ?? 0),
    handicapIndex: input.hasHandicap ? handicapValue : (existing?.handicapIndex ?? null),
    category: input.category,
    birthYear,
    birthDate: input.birthDate,
    gender,
    clubId: existing?.clubId ?? input.clubId,
    dniEnc: encryptSensitive(dniCanonical),
    dniHash,
    updatedAt: now,
  };

  const { error } = await supabase.from("Player").upsert(row, { onConflict: "id" });
  if (error) {
    console.error("[upsertPlayerFromYouthEnrollment]", error.message);
  }
}
