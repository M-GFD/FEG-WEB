"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { encryptSensitive } from "@/lib/sensitive-crypto";
import {
  canonicalDniForLookup,
  hashDniForLookup,
  normalizeDni,
} from "@/lib/empadronamiento-menores/dni";
import {
  ageOnReferenceDate,
  categoryAtSignup,
  parseBirthDateInput,
} from "@/lib/empadronamiento-menores/category";
import { getEnrollmentClubCodes } from "@/lib/empadronamiento-menores/persistence";
import { matchEnrollmentClub } from "@/lib/empadronamiento-menores/club-match";
import { INSCRIPCION_CLUB_OTRO } from "@/lib/inscripcion-torneos-menores/constants";

const yesNoEnum = z.enum(["Sí", "No", ""]);

const updateSchema = z.object({
  recordId: z.string().min(1),
  torneo: z.string().min(1, "El torneo es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  sexo: z.string().min(1, "El sexo es obligatorio"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  categoria: z.string().optional(),
  dni: z.string().optional(),
  club: z.string().min(1, "El club es obligatorio"),
  tieneHandicap: yesNoEnum,
  matricula: z.string().optional(),
  juegaPrejuveniles: yesNoEnum,
  esPrincipiante: yesNoEnum,
  responsable: z.string().min(1, "El responsable es obligatorio"),
  responsableTelefono: z.string().optional(),
  responsableEmail: z.string().optional(),
  restriccionAlimentaria: yesNoEnum,
  alimentos: z.string().optional(),
  comentarios: z.string().optional(),
});

export type UpdateInscriptoInput = z.infer<typeof updateSchema>;

function toIsoBirthDate(value: string): string | null {
  const s = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  return null;
}

function isYes(value: string | undefined): boolean {
  return (value ?? "").trim() === "Sí";
}

function encRequired(value: string | undefined): string {
  return encryptSensitive((value ?? "").trim() || "-")!;
}

function normalizeGender(value: string): string {
  const v = value.trim().toUpperCase();
  if (v === "F" || v === "MUJER" || v.startsWith("MUJ")) return "Mujer";
  if (v === "M" || v === "VARÓN" || v === "VARON" || v.startsWith("VAR")) return "Varón";
  return value.trim() || "Varón";
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

function revalidateInscriptos() {
  revalidatePath("/gestion/admin/inscriptos");
  revalidatePath("/gestion/club/inscriptos");
}

export async function updateInscripto(
  input: UpdateInscriptoInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "No autorizado" };
  }

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  const data = parsed.data;
  const isoBirth = toIsoBirthDate(data.fechaNacimiento);
  if (!isoBirth) {
    return { ok: false, error: "Fecha de nacimiento inválida (AAAA-MM-DD o DD/MM/AAAA)" };
  }
  const birthDate = parseBirthDateInput(isoBirth);
  if (!birthDate) {
    return { ok: false, error: "Fecha de nacimiento inválida" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Servicio no disponible" };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("YouthTournamentRegistration")
    .select("id,dniHash,enrollmentId")
    .eq("id", data.recordId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, error: "Inscripción no encontrada" };
  }

  const hasHandicap = isYes(data.tieneHandicap);
  const dietaryRestriction = isYes(data.restriccionAlimentaria);
  const ageAtSignup = ageOnReferenceDate(birthDate, new Date());
  const computedCategory = categoryAtSignup(birthDate, new Date());
  const category = data.categoria?.trim() || computedCategory;

  const clubNameRaw = data.club.trim();
  const clubs = await getEnrollmentClubCodes();
  const matched = matchEnrollmentClub(clubNameRaw, clubs);
  const isOtroLabel =
    clubNameRaw.toUpperCase() === INSCRIPCION_CLUB_OTRO.toUpperCase();
  const resolvedClubName = matched ? matched.name : INSCRIPCION_CLUB_OTRO;
  const clubOther = matched || isOtroLabel ? null : clubNameRaw;
  const clubId = matched?.id ?? null;

  let dniHash = existing.dniHash as string;
  const dniRaw = (data.dni ?? "").trim();
  if (dniRaw) {
    const dniCanonical = canonicalDniForLookup(normalizeDni(dniRaw));
    if (dniCanonical.length < 7) {
      return { ok: false, error: "DNI inválido" };
    }
    dniHash = hashDniForLookup(dniCanonical);
  }

  const now = new Date().toISOString();
  const patch = {
    tournamentKey: data.torneo.trim(),
    dniHash,
    responsibleName: data.responsable.trim(),
    responsiblePhoneEnc: encRequired(data.responsableTelefono),
    responsibleEmailEnc: encRequired(data.responsableEmail),
    clubName: resolvedClubName,
    clubOther,
    clubId,
    lastName: data.apellido.trim(),
    firstName: data.nombre.trim(),
    gender: normalizeGender(data.sexo),
    hasHandicap,
    matricula: hasHandicap ? data.matricula?.trim() || null : null,
    birthDate: isoBirth,
    ageAtSignup,
    category,
    playsPrejuvenilesAlso: isYes(data.juegaPrejuveniles),
    isPrincipiante: isYes(data.esPrincipiante),
    dietaryRestriction,
    dietaryFoods: dietaryRestriction ? data.alimentos?.trim() || null : null,
    comments: data.comentarios?.trim() || null,
    updatedAt: now,
  };

  const { error } = await supabase
    .from("YouthTournamentRegistration")
    .update(patch)
    .eq("id", data.recordId);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Ya existe otra inscripción con ese DNI en el mismo torneo",
      };
    }
    console.error("[updateInscripto]", error.message);
    return { ok: false, error: "No se pudo guardar la inscripción" };
  }

  revalidateInscriptos();
  return { ok: true };
}

export async function deleteInscripto(
  recordId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "No autorizado" };
  }
  if (!recordId?.trim()) {
    return { ok: false, error: "Inscripción inválida" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Servicio no disponible" };
  }

  const { error } = await supabase
    .from("YouthTournamentRegistration")
    .delete()
    .eq("id", recordId);

  if (error) {
    console.error("[deleteInscripto]", error.message);
    return { ok: false, error: "No se pudo eliminar la inscripción" };
  }

  revalidateInscriptos();
  return { ok: true };
}
