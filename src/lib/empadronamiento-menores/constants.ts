/** Temporada activa de empadronamiento (formulario FEG 2026). */
export const EMPADRONAMIENTO_SEASON_YEAR = 2026;

export const EMPADRONAMIENTO_REFERENCE_DATE = new Date(2026, 11, 31);

export const EMPADRONAMIENTO_DEPARTMENTS = [
  "COLON",
  "CONCORDIA",
  "DIAMANTE",
  "FEDERACION",
  "FEDERAL",
  "FELICIANO",
  "GUALEGUAY",
  "GUALEGUAYCHU",
  "ISLAS DEL IBICUY",
  "LA PAZ",
  "NOGOYA",
  "PARANA",
  "SAN SALVADOR",
  "TALA",
  "URUGUAY",
  "VICTORIA",
  "VILLAGUAY",
  "DESCONOCIDO",
] as const;

/** Clubes de opción (planilla Kobo / FEG 2026). */
export const EMPADRONAMIENTO_CLUBS = [
  "CLUB ATLETICO ESTUDIANTES DE PARANA",
  "CLUB DE CAMPO LIBERTADOR SAN MARTIN",
  "CLUB DE CAMPO LOS BRETES",
  "CLUB SAFRA",
  "CLUB UNIVERSITARIO (CONC. URUGUAY)",
  "CONCORDIA GOLF CLUB",
  "GOLF AERO CLUB VILLAGUAY",
  "GOLF CLUB COLON",
  "GOLF CLUB SOCIAL LA PAZ",
  "GUALEGUAYCHU COUNTRY CLUB",
  "LAS COLINAS GOLF",
  "TERMAS VILLA ELISA",
  "VICTORIA GOLF COUNTRY CLUB",
  "CLUB CICLISTA UNIDOS SAN SALVADOR",
  "AMIGOS DEL GOLF",
] as const;

export const EMPADRONAMIENTO_PROFESSORS = [
  "Federico Arca",
  "Natalia Carrizo",
  "Fernando Duré",
  "Alejandro Fernandez",
  "Gustavo Maneriro",
  "Daniel Nuñez",
  "Adrián Ponce",
  "José Quiroga",
  "José Luis Sanchez",
  "Marcelo Salva",
  "Walter Sotelo",
  "Ayelen Soto",
  "Oscar Valentini",
  "Otro",
] as const;

export const EMPADRONAMIENTO_BLOOD_GROUPS = [
  "0+",
  "0-",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
] as const;

export const EMPADRONAMIENTO_HEALTH_CONDITIONS = [
  { key: "diabetic", label: "¿Es diabético?" },
  { key: "asthmatic", label: "¿Es asmático?" },
  { key: "allergic", label: "¿Es alérgico?" },
  { key: "epilepsy", label: "¿Tiene antecedentes de epilepsia o convulsiones?" },
  { key: "tinglingHands", label: "¿Sufre hormigueos en las manos?" },
  { key: "headTrauma", label: "¿Ha tenido traumatismo de cráneo con pérdida del conocimiento?" },
  { key: "shortnessBreath", label: "¿Alguna vez experimentó excesiva falta de aire mientras realizaba ejercicios físicos?" },
  { key: "chestPain", label: "¿Alguna vez sintió dolores de pecho mientras realizaba ejercicios físicos o inmediatamente después?" },
  { key: "fainting", label: "¿Alguna vez perdió el conocimiento mientras realizaba ejercicios físicos o inmediatamente después?" },
  { key: "highBloodPressure", label: "¿Le han detectado alguna vez presión arterial alta?" },
  { key: "heartMurmur", label: "¿Le han detectado alguna vez un soplo cardíaco?" },
  { key: "other", label: "¿Otras?" },
  { key: "recentSurgery", label: "¿Fue operado en el último año?" },
] as const;

export type EmpadronamientoHealthConditionKey =
  (typeof EMPADRONAMIENTO_HEALTH_CONDITIONS)[number]["key"];

export type EmpadronamientoHealthData = {
  hasHealthInsurance: boolean;
  healthInsurance?: string;
  memberNumber?: string;
  bloodGroup?: string;
  takesMedication: boolean;
  medication?: string;
  tetanusVaccine?: boolean | null;
  conditions: Partial<Record<EmpadronamientoHealthConditionKey, boolean>>;
  allergiesDetail?: string;
  otherConditions?: string;
  surgeryDetail?: string;
};
