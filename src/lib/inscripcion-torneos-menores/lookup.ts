import { lookupPadronMenorByDni, type PadronMenorLookup } from "@/lib/padron-menores-lookup";

export type YouthEnrollmentLookup = PadronMenorLookup;

export async function lookupYouthEnrollmentByDni(
  dni: string
): Promise<{ found: true; player: YouthEnrollmentLookup } | { found: false }> {
  return lookupPadronMenorByDni(dni);
}
