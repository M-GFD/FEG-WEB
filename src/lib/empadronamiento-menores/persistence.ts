import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { encryptSensitive } from "@/lib/sensitive-crypto";
import { canonicalDniForLookup, hashDniForLookup, normalizeDni } from "./dni";
import { upsertPlayerFromYouthEnrollment } from "@/lib/padron-menores-sync";
import { lookupPadronMenorByDni } from "@/lib/padron-menores-lookup";
import {
  EMPADRONAMIENTO_SEASON_YEAR,
  type EmpadronamientoHealthData,
} from "./constants";
import { ageOnReferenceDate, categoryFromBirthDate, parseBirthDateInput } from "./category";
import { matchEnrollmentClub } from "./club-match";

export type ClubCodeOption = { name: string; code: string | null; id?: string };

export async function getEnrollmentClubCodes(): Promise<ClubCodeOption[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data } = await supabase.from("Club").select("id,name,code").order("name");
  return (data ?? []).map((c: { id: string; name: string; code: string | null }) => ({
    id: c.id,
    name: c.name,
    code: c.code,
  }));
}

export async function findYouthEnrollmentByDni(
  dni: string,
  _seasonYear = EMPADRONAMIENTO_SEASON_YEAR
): Promise<{ enrolled: boolean }> {
  const found = await lookupPadronMenorByDni(dni);
  return { enrolled: found.found };
}

function resolveClub(
  clubName: string,
  clubs: ClubCodeOption[]
): { clubId: string | null; clubCode: string | null } {
  const match = matchEnrollmentClub(clubName, clubs);
  return {
    clubId: match?.id ?? null,
    clubCode: match?.code ?? null,
  };
}

export type SubmitYouthEnrollmentInput = {
  responsibleName: string;
  responsiblePhone: string;
  lastName: string;
  firstName: string;
  gender: "Varón" | "Mujer";
  birthDate: string;
  dni: string;
  address: string;
  department: string;
  locality: string;
  phone: string;
  email: string;
  clubName: string;
  school?: string;
  hasHandicap: boolean;
  matricula?: string;
  professors: string[];
  professorOther?: string;
  tutor1Name: string;
  tutor1Dni: string;
  tutor1Phone: string;
  tutor1Email: string;
  tutor2Name?: string;
  tutor2Dni?: string;
  tutor2Email?: string;
  healthData: EmpadronamientoHealthData;
  comments?: string;
};

export async function submitYouthEnrollment(
  input: SubmitYouthEnrollmentInput,
  clubs: ClubCodeOption[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "El servicio no está disponible. Intentá más tarde." };
  }

  const dniNorm = normalizeDni(input.dni);
  if (dniNorm.length < 7) {
    return { ok: false, error: "DNI inválido." };
  }

  const dniCanonical = canonicalDniForLookup(dniNorm);
  const dniHash = hashDniForLookup(dniCanonical);
  const existing = await findYouthEnrollmentByDni(dniCanonical);
  if (existing.enrolled) {
    return {
      ok: false,
      error:
        "Este jugador ya está empadronado para la temporada 2026. El proceso es anual y solo debe realizarse una vez.",
    };
  }

  const birthDate = parseBirthDateInput(input.birthDate);
  if (!birthDate) {
    return { ok: false, error: "Fecha de nacimiento inválida." };
  }

  const category = categoryFromBirthDate(birthDate);
  if (category === "Fuera de rango") {
    return {
      ok: false,
      error: "La edad del jugador no corresponde a las categorías menores/juveniles de la temporada.",
    };
  }

  const ageDec31 = ageOnReferenceDate(birthDate);
  const { clubId, clubCode } = resolveClub(input.clubName, clubs);

  const now = new Date().toISOString();
  const row = {
    id: crypto.randomUUID(),
    seasonYear: EMPADRONAMIENTO_SEASON_YEAR,
    dniHash,
    responsibleName: input.responsibleName.trim(),
    responsiblePhoneEnc: encryptSensitive(input.responsiblePhone),
    lastName: input.lastName.trim(),
    firstName: input.firstName.trim(),
    gender: input.gender,
    birthDate: input.birthDate,
    ageDec31,
    category,
    dniEnc: encryptSensitive(dniCanonical),
    address: input.address.trim(),
    department: input.department,
    locality: input.locality.trim(),
    phoneEnc: encryptSensitive(input.phone),
    emailEnc: encryptSensitive(input.email),
    clubName: input.clubName.trim(),
    clubCode,
    clubId,
    school: input.school?.trim() || null,
    hasHandicap: input.hasHandicap,
    matricula: input.hasHandicap ? input.matricula?.trim() || null : null,
    professors: input.professors.length ? input.professors : null,
    professorOther: input.professors.includes("Otro")
      ? input.professorOther?.trim() || null
      : null,
    tutor1Name: input.tutor1Name.trim(),
    tutor1DniEnc: encryptSensitive(input.tutor1Dni),
    tutor1PhoneEnc: encryptSensitive(input.tutor1Phone),
    tutor1EmailEnc: encryptSensitive(input.tutor1Email),
    tutor2Name: input.tutor2Name?.trim() || null,
    tutor2DniEnc: input.tutor2Dni ? encryptSensitive(input.tutor2Dni) : null,
    tutor2EmailEnc: input.tutor2Email ? encryptSensitive(input.tutor2Email) : null,
    healthData: input.healthData,
    comments: input.comments?.trim() || null,
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await supabase.from("YouthEnrollment").insert(row);
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error:
          "Este jugador ya está empadronado para la temporada 2026. El proceso es anual y solo debe realizarse una vez.",
      };
    }
    console.error("[submitYouthEnrollment]", error.message);
    return { ok: false, error: "No se pudo guardar el empadronamiento. Intentá nuevamente." };
  }

  if (clubId) {
    await upsertPlayerFromYouthEnrollment({
      lastName: input.lastName,
      firstName: input.firstName,
      gender: input.gender,
      birthDate: input.birthDate,
      category,
      dni: dniCanonical,
      clubId,
      hasHandicap: input.hasHandicap,
      matricula: input.hasHandicap ? input.matricula?.trim() || null : null,
    });
  }

  return { ok: true };
}
