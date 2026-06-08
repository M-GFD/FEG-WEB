import { EMPADRONAMIENTO_REFERENCE_DATE } from "./constants";

/** Edad cumplida en una fecha de referencia (p. ej. 31/12/2026). */
export function ageOnReferenceDate(birthDate: Date, reference = EMPADRONAMIENTO_REFERENCE_DATE): number {
  let age = reference.getFullYear() - birthDate.getFullYear();
  const monthDiff = reference.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

/** Categoría según edad al 31/12/2026 (referencia planilla FEG). */
export function categoryFromBirthDate(birthDate: Date, reference = EMPADRONAMIENTO_REFERENCE_DATE): string {
  const age = ageOnReferenceDate(birthDate, reference);
  if (age < 7) return "Principiante";
  if (age <= 9) return "Birdie";
  if (age <= 11) return "Águila";
  if (age <= 13) return "Albatros";
  if (age <= 15) return "Prejuveniles";
  if (age <= 18) return "Juveniles";
  if (age <= 22) return "Sub 23";
  return "Fuera de rango";
}

/** Categoría según edad al día de la inscripción (hoy). */
export function categoryAtSignup(birthDate: Date, now = new Date()): string {
  return categoryFromBirthDate(birthDate, now);
}

/** Fecha de referencia (31/12) de la temporada vigente al momento `now`. */
export function currentSeasonReferenceDate(now = new Date()): Date {
  return new Date(now.getFullYear(), 11, 31);
}

/**
 * Categoría dinámica: se recalcula según la edad al 31/12 de la temporada vigente,
 * en lugar de usar el valor congelado al momento del empadronamiento.
 */
export function currentCategoryFromBirthDate(birthDate: Date, now = new Date()): string {
  return categoryFromBirthDate(birthDate, currentSeasonReferenceDate(now));
}

/** Edad al 31/12 de la temporada vigente. */
export function currentAgeOnReferenceDate(birthDate: Date, now = new Date()): number {
  return ageOnReferenceDate(birthDate, currentSeasonReferenceDate(now));
}

export function parseBirthDateInput(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}
