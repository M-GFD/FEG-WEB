import { EMPADRONAMIENTO_CLUBS } from "@/lib/empadronamiento-menores/constants";

export const INSCRIPCION_CLUB_OTRO = "OTRO CLUB NO PERTENECIENTE A LA FEDERACION";

export const INSCRIPCION_CLUBS = [
  ...EMPADRONAMIENTO_CLUBS,
  INSCRIPCION_CLUB_OTRO,
] as const;

export type InscripcionClubName = (typeof INSCRIPCION_CLUBS)[number];
