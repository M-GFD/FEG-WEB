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
};

function buildYouthPlayerId(
  dniCanonical: string,
  lastName: string,
  firstName: string,
  clubId: string
): string {
  const h = crypto
    .createHash("sha1")
    .update(`${dniCanonical}|${lastName}|${firstName}|${clubId}`)
    .digest("hex")
    .slice(0, 12);
  return `player_youth_${h}`;
}

/**
 * Réplica en Player los datos mínimos del empadronamiento web para que la
 * inscripción a torneos encuentre al jugador sin import manual.
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

  const { data: existing } = await supabase
    .from("Player")
    .select("id")
    .eq("firstName", input.firstName.trim())
    .eq("lastName", input.lastName.trim())
    .eq("clubId", input.clubId)
    .maybeSingle();

  const id = existing?.id ?? buildYouthPlayerId(
    dniCanonical,
    input.lastName.trim(),
    input.firstName.trim(),
    input.clubId
  );

  const row = {
    id,
    matricula: input.matricula,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    handicap: input.hasHandicap ? 1 : 0,
    category: input.category,
    birthYear,
    birthDate: input.birthDate,
    gender,
    clubId: input.clubId,
    dniEnc: encryptSensitive(dniCanonical),
    dniHash,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase.from("Player").upsert(row, { onConflict: "id" });
  if (error) {
    console.error("[upsertPlayerFromYouthEnrollment]", error.message);
  }
}
