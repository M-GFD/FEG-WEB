import { getSupabaseAdmin } from "@/lib/supabase";
import { hashDniForLookup, normalizeDni } from "@/lib/empadronamiento-menores/dni";
import { EMPADRONAMIENTO_SEASON_YEAR } from "@/lib/empadronamiento-menores/constants";

export type YouthEnrollmentLookup = {
  enrollmentId: string;
  lastName: string;
  firstName: string;
  gender: string;
  birthDate: string;
  clubName: string;
  hasHandicap: boolean;
  matricula: string | null;
};

export async function lookupYouthEnrollmentByDni(
  dni: string
): Promise<{ found: true; player: YouthEnrollmentLookup } | { found: false }> {
  const supabase = getSupabaseAdmin();
  const dniHash = hashDniForLookup(normalizeDni(dni));
  if (!supabase || !dniHash) return { found: false };

  const { data, error } = await supabase
    .from("YouthEnrollment")
    .select(
      "id,lastName,firstName,gender,birthDate,clubName,hasHandicap,matricula"
    )
    .eq("seasonYear", EMPADRONAMIENTO_SEASON_YEAR)
    .eq("dniHash", dniHash)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[lookupYouthEnrollmentByDni]", error.message);
    return { found: false };
  }

  const birthDate =
    typeof data.birthDate === "string"
      ? data.birthDate.slice(0, 10)
      : String(data.birthDate);

  return {
    found: true,
    player: {
      enrollmentId: data.id,
      lastName: data.lastName,
      firstName: data.firstName,
      gender: data.gender,
      birthDate,
      clubName: data.clubName,
      hasHandicap: Boolean(data.hasHandicap),
      matricula: data.matricula,
    },
  };
}
