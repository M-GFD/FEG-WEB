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
  categoryFromBirthDate,
  parseBirthDateInput,
} from "@/lib/empadronamiento-menores/category";
import {
  type EmpadronamientoHealthData,
} from "@/lib/empadronamiento-menores/constants";
import { getEnrollmentClubCodes } from "@/lib/empadronamiento-menores/persistence";
import { matchEnrollmentClub } from "@/lib/empadronamiento-menores/club-match";
import { upsertPlayerFromYouthEnrollment } from "@/lib/padron-menores-sync";
import type { EmpadronadoSource } from "@/lib/admin-exports";

const updateSchema = z.object({
  recordId: z.string().min(1),
  source: z.enum(["enrollment", "player"]),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  sexo: z.string().min(1, "El sexo es obligatorio"),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  categoria: z.string().optional(),
  dni: z.string().min(7, "DNI inválido"),
  club: z.string().min(1, "El club es obligatorio"),
  responsable: z.string().optional(),
  responsableTelefono: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().optional(),
  direccion: z.string().optional(),
  departamento: z.string().optional(),
  localidad: z.string().optional(),
  escuela: z.string().optional(),
  tieneHandicap: z.enum(["Sí", "No", ""]),
  matricula: z.string().optional(),
  profesores: z.string().optional(),
  tutor1Nombre: z.string().optional(),
  tutor1Dni: z.string().optional(),
  tutor1Telefono: z.string().optional(),
  tutor1Email: z.string().optional(),
  tutor2Nombre: z.string().optional(),
  tutor2Dni: z.string().optional(),
  tutor2Email: z.string().optional(),
  obraSocial: z.string().optional(),
  grupoSanguineo: z.string().optional(),
  condicionesSalud: z.string().optional(),
  comentarios: z.string().optional(),
});

export type UpdateEmpadronadoInput = z.infer<typeof updateSchema>;

function toIsoBirthDate(value: string): string | null {
  const s = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  return null;
}

function normalizeGenderLabel(value: string): "Varón" | "Mujer" {
  const v = value.trim().toUpperCase();
  if (v === "F" || v === "MUJER" || v.startsWith("MUJ")) return "Mujer";
  return "Varón";
}

function parseProfessors(raw: string | undefined): {
  professors: string[] | null;
  professorOther: string | null;
} {
  if (!raw?.trim()) return { professors: null, professorOther: null };
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  let professorOther: string | null = null;
  const professors = parts.map((p) => {
    const m = p.match(/^Otro:\s*(.+)$/i);
    if (m) {
      professorOther = m[1].trim();
      return "Otro";
    }
    return p;
  });
  return { professors: professors.length ? professors : null, professorOther };
}

function hasHandicapFrom(value: string | undefined): boolean {
  return (value ?? "").trim() === "Sí";
}

/** YouthEnrollment exige String en varios Enc; vacío → cifrado de marcador. */
function encRequired(value: string | undefined): string {
  return encryptSensitive((value ?? "").trim() || "-")!;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function updateEmpadronado(
  input: UpdateEmpadronadoInput
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
    return { ok: false, error: "Fecha de nacimiento inválida (usá AAAA-MM-DD o DD/MM/AAAA)" };
  }
  const birthDate = parseBirthDateInput(isoBirth);
  if (!birthDate) {
    return { ok: false, error: "Fecha de nacimiento inválida" };
  }

  const dniCanonical = canonicalDniForLookup(normalizeDni(data.dni));
  if (dniCanonical.length < 7) {
    return { ok: false, error: "DNI inválido" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Servicio no disponible" };
  }

  const genderLabel = normalizeGenderLabel(data.sexo);
  const ageDec31 = ageOnReferenceDate(birthDate);
  const computedCategory = categoryFromBirthDate(birthDate);
  const category =
    data.categoria?.trim() ||
    (computedCategory === "Fuera de rango" ? "Fuera de rango" : computedCategory);
  const hasHandicap = hasHandicapFrom(data.tieneHandicap);
  const matricula = hasHandicap ? data.matricula?.trim() || null : null;
  const now = new Date().toISOString();

  if (data.source === "enrollment") {
    return updateEnrollment({
      data,
      isoBirth,
      dniCanonical,
      genderLabel,
      ageDec31,
      category,
      hasHandicap,
      matricula,
      now,
    });
  }

  return updatePlayer({
    data,
    isoBirth,
    dniCanonical,
    genderLabel,
    category,
    hasHandicap,
    matricula,
    now,
  });
}

async function updateEnrollment(args: {
  data: UpdateEmpadronadoInput;
  isoBirth: string;
  dniCanonical: string;
  genderLabel: "Varón" | "Mujer";
  ageDec31: number;
  category: string;
  hasHandicap: boolean;
  matricula: string | null;
  now: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, isoBirth, dniCanonical, genderLabel, ageDec31, category, hasHandicap, matricula, now } =
    args;
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Servicio no disponible" };

  const { data: existing, error: fetchError } = await supabase
    .from("YouthEnrollment")
    .select("id,healthData,seasonYear")
    .eq("id", data.recordId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, error: "Empadronamiento no encontrado" };
  }

  const clubs = await getEnrollmentClubCodes();
  const clubMatch = matchEnrollmentClub(data.club, clubs);
  const { professors, professorOther } = parseProfessors(data.profesores);
  const prevHealth = (existing.healthData ?? {}) as EmpadronamientoHealthData;
  const obraSocial = data.obraSocial?.trim() ?? "";
  const healthData: EmpadronamientoHealthData = {
    ...prevHealth,
    hasHealthInsurance: Boolean(obraSocial),
    healthInsurance: obraSocial || undefined,
    bloodGroup: data.grupoSanguineo?.trim() || undefined,
    takesMedication: prevHealth.takesMedication ?? false,
    conditions: prevHealth.conditions ?? {},
    otherConditions: data.condicionesSalud?.trim() || prevHealth.otherConditions,
  };

  const dniHash = hashDniForLookup(dniCanonical);
  const patch = {
    dniHash,
    responsibleName: (data.responsable ?? "").trim() || "—",
    responsiblePhoneEnc: encRequired(data.responsableTelefono),
    lastName: data.apellido.trim(),
    firstName: data.nombre.trim(),
    gender: genderLabel,
    birthDate: isoBirth,
    ageDec31,
    category,
    dniEnc: encRequired(dniCanonical),
    address: (data.direccion ?? "").trim() || "—",
    department: (data.departamento ?? "").trim() || "DESCONOCIDO",
    locality: (data.localidad ?? "").trim() || "—",
    phoneEnc: encRequired(data.telefono),
    emailEnc: encRequired(data.email),
    clubName: data.club.trim(),
    clubCode: clubMatch?.code ?? null,
    clubId: clubMatch?.id ?? null,
    school: data.escuela?.trim() || null,
    hasHandicap,
    matricula,
    professors,
    professorOther,
    tutor1Name: (data.tutor1Nombre ?? "").trim() || "—",
    tutor1DniEnc: encRequired(data.tutor1Dni),
    tutor1PhoneEnc: encRequired(data.tutor1Telefono),
    tutor1EmailEnc: encRequired(data.tutor1Email),
    tutor2Name: data.tutor2Nombre?.trim() || null,
    tutor2DniEnc: data.tutor2Dni?.trim()
      ? encryptSensitive(data.tutor2Dni)
      : null,
    tutor2EmailEnc: data.tutor2Email?.trim()
      ? encryptSensitive(data.tutor2Email)
      : null,
    healthData,
    comments: data.comentarios?.trim() || null,
    updatedAt: now,
  };

  const { error } = await supabase
    .from("YouthEnrollment")
    .update(patch)
    .eq("id", data.recordId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ya existe otro empadronamiento con ese DNI en la temporada" };
    }
    console.error("[updateEmpadronado] enrollment", error.message);
    return { ok: false, error: "No se pudo guardar el empadronamiento" };
  }

  if (clubMatch?.id) {
    await upsertPlayerFromYouthEnrollment({
      lastName: data.apellido,
      firstName: data.nombre,
      gender: genderLabel,
      birthDate: isoBirth,
      category,
      dni: dniCanonical,
      clubId: clubMatch.id,
      hasHandicap,
      matricula,
    });
  }

  revalidatePath("/gestion/admin/empadronados");
  return { ok: true };
}

async function updatePlayer(args: {
  data: UpdateEmpadronadoInput;
  isoBirth: string;
  dniCanonical: string;
  genderLabel: "Varón" | "Mujer";
  category: string;
  hasHandicap: boolean;
  matricula: string | null;
  now: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, isoBirth, dniCanonical, genderLabel, category, hasHandicap, matricula, now } =
    args;
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Servicio no disponible" };

  const { data: existing, error: fetchError } = await supabase
    .from("Player")
    .select("id")
    .eq("id", data.recordId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { ok: false, error: "Jugador no encontrado" };
  }

  const clubs = await getEnrollmentClubCodes();
  const clubMatch = matchEnrollmentClub(data.club, clubs);
  if (!clubMatch?.id) {
    return { ok: false, error: "No se encontró el club indicado" };
  }

  const birthYear = parseInt(isoBirth.slice(0, 4), 10) || 1900;
  const patch = {
    firstName: data.nombre.trim(),
    lastName: data.apellido.trim(),
    gender: genderLabel === "Mujer" ? "F" : "M",
    birthDate: isoBirth,
    birthYear,
    category,
    clubId: clubMatch.id,
    handicap: hasHandicap ? 1 : 0,
    matricula,
    dniEnc: encryptSensitive(dniCanonical),
    dniHash: hashDniForLookup(dniCanonical),
    updatedAt: now,
  };

  const { error } = await supabase.from("Player").update(patch).eq("id", data.recordId);
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Conflicto: ya existe un jugador con ese nombre en el mismo club",
      };
    }
    console.error("[updateEmpadronado] player", error.message);
    return { ok: false, error: "No se pudo guardar el jugador" };
  }

  revalidatePath("/gestion/admin/empadronados");
  return { ok: true };
}

/** Tipado auxiliar exportado para el formulario cliente. */
export type EmpadronadoEditSource = EmpadronadoSource;
