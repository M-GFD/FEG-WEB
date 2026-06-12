"use server";

import { z } from "zod";
import { INSCRIPCION_CLUBS, INSCRIPCION_CLUB_OTRO } from "@/lib/inscripcion-torneos-menores/constants";
import { lookupYouthEnrollmentByDni } from "@/lib/inscripcion-torneos-menores/lookup";
import { submitYouthTournamentRegistration } from "@/lib/inscripcion-torneos-menores/persistence";

const submitSchema = z
  .object({
    tournamentKey: z.string().min(1),
    enrollmentId: z.string().min(1),
    dni: z.string().min(7),
    responsibleName: z.string().min(2),
    responsiblePhone: z.string().min(8),
    responsibleEmail: z.string().email(),
    clubName: z.enum([...INSCRIPCION_CLUBS] as [string, ...string[]]),
    clubOther: z.string().optional(),
    lastName: z.string().min(1),
    firstName: z.string().min(1),
    gender: z.enum(["Varón", "Mujer"]),
    hasHandicap: z.boolean(),
    matricula: z.string().optional(),
    birthDate: z.string().min(1),
    playsPrejuvenilesAlso: z.boolean().default(false),
    isPrincipiante: z.boolean().default(false),
    dietaryRestriction: z.boolean(),
    dietaryFoods: z.string().optional(),
    comments: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasHandicap && !data.matricula?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "matriculaRequired",
        path: ["matricula"],
      });
    }
    if (data.clubName === INSCRIPCION_CLUB_OTRO && !data.clubOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "clubOtherRequired",
        path: ["clubOther"],
      });
    }
    if (data.dietaryRestriction && !data.dietaryFoods?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "dietaryFoodsRequired",
        path: ["dietaryFoods"],
      });
    }
  });

export async function searchPlayerByDni(dni: string) {
  return lookupYouthEnrollmentByDni(dni);
}

export async function submitInscripcionTorneoForm(raw: unknown) {
  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      errorKey: parsed.error.errors[0]?.message ?? "invalidForm",
    };
  }
  return submitYouthTournamentRegistration(parsed.data);
}
