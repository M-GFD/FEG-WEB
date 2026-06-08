import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { encryptSensitive } from "@/lib/sensitive-crypto";
import { hashDniForLookup, normalizeDni } from "@/lib/empadronamiento-menores/dni";
import {
  ageOnReferenceDate,
  categoryAtSignup,
  currentCategoryFromBirthDate,
  parseBirthDateInput,
} from "@/lib/empadronamiento-menores/category";
import { matchEnrollmentClub } from "@/lib/empadronamiento-menores/club-match";
import { getEnrollmentClubCodes } from "@/lib/empadronamiento-menores/persistence";
import { INSCRIPCION_CLUB_OTRO } from "./constants";
import { getActiveYouthTournamentConfig } from "./config";
import { lookupYouthEnrollmentByDni } from "./lookup";

export type SubmitTournamentRegistrationInput = {
  tournamentKey: string;
  enrollmentId: string;
  dni: string;
  responsibleName: string;
  responsiblePhone: string;
  responsibleEmail: string;
  clubName: string;
  clubOther?: string;
  lastName: string;
  firstName: string;
  gender: string;
  hasHandicap: boolean;
  matricula?: string;
  birthDate: string;
  playsPrejuvenilesAlso: boolean;
  isPrincipiante: boolean;
  dietaryRestriction: boolean;
  dietaryFoods?: string;
  comments?: string;
};

export async function submitYouthTournamentRegistration(
  input: SubmitTournamentRegistrationInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = await getActiveYouthTournamentConfig();
  if (!config) {
    return { ok: false, error: "No hay torneo abierto para inscripciones." };
  }
  if (input.tournamentKey !== config.tournamentKey) {
    return { ok: false, error: "El torneo de inscripción no coincide con el activo." };
  }

  const lookup = await lookupYouthEnrollmentByDni(input.dni);
  if (!lookup.found) {
    return {
      ok: false,
      error:
        "El jugador no está empadronado. Debe completar el empadronamiento anual antes de inscribirse.",
    };
  }
  if (lookup.player.enrollmentId !== input.enrollmentId) {
    return { ok: false, error: "Los datos del jugador no coinciden con el padrón." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "El servicio no está disponible." };
  }

  const dniNorm = normalizeDni(input.dni);
  const dniHash = hashDniForLookup(dniNorm);
  const birthDate = parseBirthDateInput(input.birthDate);
  if (!birthDate) {
    return { ok: false, error: "Fecha de nacimiento inválida." };
  }

  const now = new Date();
  const ageAtSignup = ageOnReferenceDate(birthDate, now);
  const category = categoryAtSignup(birthDate, now);

  const clubs = await getEnrollmentClubCodes();
  const clubMatch =
    input.clubName === INSCRIPCION_CLUB_OTRO
      ? null
      : matchEnrollmentClub(input.clubName, clubs);

  const row = {
    id: crypto.randomUUID(),
    tournamentKey: config.tournamentKey,
    enrollmentId: input.enrollmentId,
    dniHash,
    responsibleName: input.responsibleName.trim(),
    responsiblePhoneEnc: encryptSensitive(input.responsiblePhone),
    responsibleEmailEnc: encryptSensitive(input.responsibleEmail),
    clubName: input.clubName.trim(),
    clubOther:
      input.clubName === INSCRIPCION_CLUB_OTRO ? input.clubOther?.trim() || null : null,
    clubId: clubMatch?.id ?? null,
    lastName: input.lastName.trim(),
    firstName: input.firstName.trim(),
    gender: input.gender,
    hasHandicap: input.hasHandicap,
    matricula: input.hasHandicap ? input.matricula?.trim() || null : null,
    birthDate: input.birthDate,
    ageAtSignup,
    category,
    playsPrejuvenilesAlso: input.playsPrejuvenilesAlso,
    isPrincipiante: input.isPrincipiante,
    dietaryRestriction: input.dietaryRestriction,
    dietaryFoods: input.dietaryRestriction ? input.dietaryFoods?.trim() || null : null,
    comments: input.comments?.trim() || null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const { error } = await supabase.from("YouthTournamentRegistration").insert(row);
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Este jugador ya está inscripto en el torneo activo.",
      };
    }
    console.error("[submitYouthTournamentRegistration]", error.message);
    return { ok: false, error: "No se pudo registrar la inscripción." };
  }

  return { ok: true };
}

export type TournamentRegistrationListItem = {
  id: string;
  lastName: string;
  firstName: string;
  gender: string;
  category: string;
  birthDate: string;
  clubName: string;
  clubOther: string | null;
  hasHandicap: boolean;
  matricula: string | null;
  playsPrejuvenilesAlso: boolean;
  isPrincipiante: boolean;
  dietaryRestriction: boolean;
  createdAt: string;
};

export async function listYouthTournamentRegistrations(options: {
  tournamentKey: string;
  clubId?: string | null;
  isAdmin?: boolean;
}): Promise<TournamentRegistrationListItem[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("YouthTournamentRegistration")
    .select(
      "id,lastName,firstName,gender,category,birthDate,clubName,clubOther,hasHandicap,matricula,playsPrejuvenilesAlso,isPrincipiante,dietaryRestriction,createdAt,clubId"
    )
    .eq("tournamentKey", options.tournamentKey)
    .order("lastName", { ascending: true });

  if (!options.isAdmin && options.clubId) {
    query = query.eq("clubId", options.clubId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listYouthTournamentRegistrations]", error.message);
    return [];
  }

  return (data ?? []).map((row): TournamentRegistrationListItem => {
    const bd = parseBirthDateInput(String(row.birthDate ?? "").slice(0, 10));
    return {
      id: row.id,
      lastName: row.lastName,
      firstName: row.firstName,
      gender: row.gender,
      category: bd ? currentCategoryFromBirthDate(bd) : row.category,
      birthDate: row.birthDate,
      clubName: row.clubName,
      clubOther: row.clubOther,
      hasHandicap: row.hasHandicap,
      matricula: row.matricula,
      playsPrejuvenilesAlso: row.playsPrejuvenilesAlso,
      isPrincipiante: row.isPrincipiante,
      dietaryRestriction: row.dietaryRestriction,
      createdAt: row.createdAt,
    };
  });
}
