import "server-only";
import ExcelJS from "exceljs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { decryptSensitive } from "@/lib/sensitive-crypto";
import { hashDniForLookup } from "@/lib/empadronamiento-menores/dni";
import {
  EMPADRONAMIENTO_SEASON_YEAR,
  EMPADRONAMIENTO_HEALTH_CONDITIONS,
  type EmpadronamientoHealthData,
} from "@/lib/empadronamiento-menores/constants";

/** Columna de una exportación: clave de objeto + encabezado legible + ancho. */
export type ExportColumn<T> = {
  key: keyof T & string;
  header: string;
  width?: number;
};

function safeDecrypt(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return decryptSensitive(value) ?? "";
  } catch {
    return "";
  }
}

function yesNo(value: boolean | null | undefined): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "";
}

/** Normaliza el género de Player (M/F) al texto del padrón (Varón/Mujer). */
function normalizeGender(value: string | null | undefined): string {
  const v = String(value ?? "").trim().toUpperCase();
  if (v === "F" || v === "MUJER") return "Mujer";
  if (v === "M" || v === "VARÓN" || v === "VARON") return "Varón";
  return value ?? "";
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const s = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
  }
  return s;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

// ----------------- Empadronados -----------------

export type EmpadronadoExportRow = {
  apellido: string;
  nombre: string;
  sexo: string;
  fechaNacimiento: string;
  edadDic31: string;
  categoria: string;
  dni: string;
  club: string;
  responsable: string;
  responsableTelefono: string;
  telefono: string;
  email: string;
  direccion: string;
  departamento: string;
  localidad: string;
  escuela: string;
  tieneHandicap: string;
  matricula: string;
  profesores: string;
  tutor1Nombre: string;
  tutor1Dni: string;
  tutor1Telefono: string;
  tutor1Email: string;
  tutor2Nombre: string;
  tutor2Dni: string;
  tutor2Email: string;
  obraSocial: string;
  grupoSanguineo: string;
  condicionesSalud: string;
  comentarios: string;
  fechaRegistro: string;
};

export const EMPADRONADOS_COLUMNS: ExportColumn<EmpadronadoExportRow>[] = [
  { key: "apellido", header: "Apellido", width: 20 },
  { key: "nombre", header: "Nombre", width: 20 },
  { key: "sexo", header: "Sexo", width: 8 },
  { key: "fechaNacimiento", header: "Fecha de nacimiento", width: 16 },
  { key: "edadDic31", header: "Edad (31/12)", width: 12 },
  { key: "categoria", header: "Categoría", width: 16 },
  { key: "dni", header: "DNI", width: 14 },
  { key: "club", header: "Club", width: 28 },
  { key: "responsable", header: "Responsable de carga", width: 22 },
  { key: "responsableTelefono", header: "Tel. responsable", width: 16 },
  { key: "telefono", header: "Teléfono jugador", width: 16 },
  { key: "email", header: "Email", width: 26 },
  { key: "direccion", header: "Dirección", width: 24 },
  { key: "departamento", header: "Departamento", width: 16 },
  { key: "localidad", header: "Localidad", width: 16 },
  { key: "escuela", header: "Escuela", width: 20 },
  { key: "tieneHandicap", header: "Tiene handicap", width: 12 },
  { key: "matricula", header: "Matrícula", width: 12 },
  { key: "profesores", header: "Profesores", width: 24 },
  { key: "tutor1Nombre", header: "Tutor 1", width: 20 },
  { key: "tutor1Dni", header: "DNI tutor 1", width: 14 },
  { key: "tutor1Telefono", header: "Tel. tutor 1", width: 16 },
  { key: "tutor1Email", header: "Email tutor 1", width: 24 },
  { key: "tutor2Nombre", header: "Tutor 2", width: 20 },
  { key: "tutor2Dni", header: "DNI tutor 2", width: 14 },
  { key: "tutor2Email", header: "Email tutor 2", width: 24 },
  { key: "obraSocial", header: "Obra social", width: 18 },
  { key: "grupoSanguineo", header: "Grupo sanguíneo", width: 12 },
  { key: "condicionesSalud", header: "Condiciones de salud", width: 30 },
  { key: "comentarios", header: "Comentarios", width: 30 },
  { key: "fechaRegistro", header: "Fecha de registro", width: 18 },
];

function healthSummary(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const health = raw as EmpadronamientoHealthData;
  const parts: string[] = [];
  if (health.takesMedication && health.medication) {
    parts.push(`Medicación: ${health.medication}`);
  }
  const conditions = health.conditions ?? {};
  for (const { key, label } of EMPADRONAMIENTO_HEALTH_CONDITIONS) {
    if (conditions[key]) parts.push(label.replace(/^¿|\?$/g, ""));
  }
  if (health.allergiesDetail) parts.push(`Alergias: ${health.allergiesDetail}`);
  if (health.otherConditions) parts.push(`Otras: ${health.otherConditions}`);
  if (health.surgeryDetail) parts.push(`Cirugía: ${health.surgeryDetail}`);
  return parts.join(" · ");
}

function professorsSummary(professors: unknown, professorOther: string | null): string {
  const list = Array.isArray(professors) ? professors.map(String) : [];
  const mapped = list.map((p) => (p === "Otro" && professorOther ? `Otro: ${professorOther}` : p));
  return mapped.join(", ");
}

export async function fetchEmpadronadosRows(
  seasonYear = EMPADRONAMIENTO_SEASON_YEAR
): Promise<EmpadronadoExportRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const seenDniHash = new Set<string>();
  const rows: EmpadronadoExportRow[] = [];

  // 1) Empadronamientos cargados por el formulario web (datos completos).
  const { data: enrollments, error } = await supabase
    .from("YouthEnrollment")
    .select("*")
    .eq("seasonYear", seasonYear)
    .order("lastName", { ascending: true });

  if (error) {
    console.error("[fetchEmpadronadosRows] YouthEnrollment", error.message);
  }

  for (const row of enrollments ?? []) {
    if (row.dniHash) seenDniHash.add(row.dniHash);
    const health = row.healthData as EmpadronamientoHealthData | null;
    rows.push({
      apellido: row.lastName ?? "",
      nombre: row.firstName ?? "",
      sexo: row.gender ?? "",
      fechaNacimiento: formatDate(row.birthDate),
      edadDic31: row.ageDec31 != null ? String(row.ageDec31) : "",
      categoria: row.category ?? "",
      dni: safeDecrypt(row.dniEnc),
      club: row.clubName ?? "",
      responsable: row.responsibleName ?? "",
      responsableTelefono: safeDecrypt(row.responsiblePhoneEnc),
      telefono: safeDecrypt(row.phoneEnc),
      email: safeDecrypt(row.emailEnc),
      direccion: row.address ?? "",
      departamento: row.department ?? "",
      localidad: row.locality ?? "",
      escuela: row.school ?? "",
      tieneHandicap: yesNo(row.hasHandicap),
      matricula: row.matricula ?? "",
      profesores: professorsSummary(row.professors, row.professorOther),
      tutor1Nombre: row.tutor1Name ?? "",
      tutor1Dni: safeDecrypt(row.tutor1DniEnc),
      tutor1Telefono: safeDecrypt(row.tutor1PhoneEnc),
      tutor1Email: safeDecrypt(row.tutor1EmailEnc),
      tutor2Nombre: row.tutor2Name ?? "",
      tutor2Dni: safeDecrypt(row.tutor2DniEnc),
      tutor2Email: safeDecrypt(row.tutor2EmailEnc),
      obraSocial: health?.hasHealthInsurance ? health.healthInsurance ?? "Sí" : "",
      grupoSanguineo: health?.bloodGroup ?? "",
      condicionesSalud: healthSummary(health),
      comentarios: row.comments ?? "",
      fechaRegistro: formatDateTime(row.createdAt),
    });
  }

  // 2) Padrón ya cargado en la tabla Player (importado / sincronizado).
  const { data: players, error: playerError } = await supabase
    .from("Player")
    .select("firstName,lastName,gender,birthDate,birthYear,category,matricula,dniEnc,dniHash,createdAt,club:Club(name)")
    .like("id", "player_youth_%")
    .order("lastName", { ascending: true });

  if (playerError) {
    console.error("[fetchEmpadronadosRows] Player", playerError.message);
  }

  for (const row of players ?? []) {
    const dni = safeDecrypt(row.dniEnc);
    const dniHash =
      (row.dniHash as string | null) || (dni ? hashDniForLookup(dni) : "");
    if (dniHash && seenDniHash.has(dniHash)) continue;
    if (dniHash) seenDniHash.add(dniHash);

    const clubRaw = row.club as { name: string } | { name: string }[] | null;
    const club = Array.isArray(clubRaw) ? clubRaw[0]?.name ?? "" : clubRaw?.name ?? "";
    const birthYear =
      typeof row.birthYear === "number" && row.birthYear > 1900 ? row.birthYear : null;

    rows.push({
      apellido: row.lastName ?? "",
      nombre: row.firstName ?? "",
      sexo: normalizeGender(row.gender),
      fechaNacimiento: formatDate(row.birthDate),
      edadDic31: birthYear ? String(seasonYear - birthYear) : "",
      categoria: row.category ?? "",
      dni,
      club,
      responsable: "",
      responsableTelefono: "",
      telefono: "",
      email: "",
      direccion: "",
      departamento: "",
      localidad: "",
      escuela: "",
      tieneHandicap: row.matricula ? "Sí" : "",
      matricula: row.matricula ?? "",
      profesores: "",
      tutor1Nombre: "",
      tutor1Dni: "",
      tutor1Telefono: "",
      tutor1Email: "",
      tutor2Nombre: "",
      tutor2Dni: "",
      tutor2Email: "",
      obraSocial: "",
      grupoSanguineo: "",
      condicionesSalud: "",
      comentarios: "",
      fechaRegistro: formatDateTime(row.createdAt),
    });
  }

  rows.sort((a, b) =>
    `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es", {
      sensitivity: "base",
    })
  );

  return rows;
}

// ----------------- Inscriptos a torneos -----------------

export type InscriptoExportRow = {
  torneo: string;
  apellido: string;
  nombre: string;
  sexo: string;
  fechaNacimiento: string;
  edad: string;
  categoria: string;
  dni: string;
  club: string;
  tieneHandicap: string;
  matricula: string;
  juegaPrejuveniles: string;
  responsable: string;
  responsableTelefono: string;
  responsableEmail: string;
  restriccionAlimentaria: string;
  alimentos: string;
  comentarios: string;
  fechaInscripcion: string;
};

export const INSCRIPTOS_COLUMNS: ExportColumn<InscriptoExportRow>[] = [
  { key: "torneo", header: "Torneo", width: 24 },
  { key: "apellido", header: "Apellido", width: 20 },
  { key: "nombre", header: "Nombre", width: 20 },
  { key: "sexo", header: "Sexo", width: 8 },
  { key: "fechaNacimiento", header: "Fecha de nacimiento", width: 16 },
  { key: "edad", header: "Edad", width: 8 },
  { key: "categoria", header: "Categoría", width: 16 },
  { key: "dni", header: "DNI", width: 14 },
  { key: "club", header: "Club", width: 28 },
  { key: "tieneHandicap", header: "Tiene handicap", width: 12 },
  { key: "matricula", header: "Matrícula", width: 12 },
  { key: "juegaPrejuveniles", header: "Juega Prejuveniles", width: 16 },
  { key: "responsable", header: "Responsable de carga", width: 22 },
  { key: "responsableTelefono", header: "Tel. responsable", width: 16 },
  { key: "responsableEmail", header: "Email responsable", width: 26 },
  { key: "restriccionAlimentaria", header: "Restricción alimentaria", width: 18 },
  { key: "alimentos", header: "Alimentos a evitar", width: 24 },
  { key: "comentarios", header: "Comentarios", width: 30 },
  { key: "fechaInscripcion", header: "Fecha de inscripción", width: 18 },
];

export async function fetchInscriptosRows(
  tournamentKey?: string
): Promise<InscriptoExportRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("YouthTournamentRegistration")
    .select("*")
    .order("lastName", { ascending: true });

  if (tournamentKey) {
    query = query.eq("tournamentKey", tournamentKey);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[fetchInscriptosRows]", error.message);
    return [];
  }

  return (data ?? []).map((row): InscriptoExportRow => ({
    torneo: row.tournamentKey ?? "",
    apellido: row.lastName ?? "",
    nombre: row.firstName ?? "",
    sexo: row.gender ?? "",
    fechaNacimiento: formatDate(row.birthDate),
    edad: row.ageAtSignup != null ? String(row.ageAtSignup) : "",
    categoria: row.category ?? "",
    dni: safeDecrypt(row.dniEnc),
    club: row.clubOther || row.clubName || "",
    tieneHandicap: yesNo(row.hasHandicap),
    matricula: row.matricula ?? "",
    juegaPrejuveniles: yesNo(row.playsPrejuvenilesAlso),
    responsable: row.responsibleName ?? "",
    responsableTelefono: safeDecrypt(row.responsiblePhoneEnc),
    responsableEmail: safeDecrypt(row.responsibleEmailEnc),
    restriccionAlimentaria: yesNo(row.dietaryRestriction),
    alimentos: row.dietaryFoods ?? "",
    comentarios: row.comments ?? "",
    fechaInscripcion: formatDateTime(row.createdAt),
  }));
}

// ----------------- Generación XLSX -----------------

export async function buildXlsxBuffer<T extends Record<string, unknown>>(
  sheetName: string,
  columns: ExportColumn<T>[],
  rows: T[]
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FEG";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 18,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF123C15" },
  };
  headerRow.alignment = { vertical: "middle" };

  for (const row of rows) {
    sheet.addRow(row);
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  const data = await workbook.xlsx.writeBuffer();
  if (data instanceof ArrayBuffer) return data;
  const view = data as Uint8Array;
  return view.buffer.slice(
    view.byteOffset,
    view.byteOffset + view.byteLength
  ) as ArrayBuffer;
}
