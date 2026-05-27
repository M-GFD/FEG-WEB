"use server";

import { z } from "zod";
import {
  EMPADRONAMIENTO_CLUBS,
  EMPADRONAMIENTO_DEPARTMENTS,
  EMPADRONAMIENTO_PROFESSORS,
  type EmpadronamientoHealthData,
} from "@/lib/empadronamiento-menores/constants";
import {
  findYouthEnrollmentByDni,
  getEnrollmentClubCodes,
  submitYouthEnrollment,
} from "@/lib/empadronamiento-menores/persistence";

const healthSchema = z.object({
  hasHealthInsurance: z.boolean(),
  healthInsurance: z.string().optional(),
  memberNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
  takesMedication: z.boolean(),
  medication: z.string().optional(),
  tetanusVaccine: z.boolean().nullable().optional(),
  conditions: z.record(z.boolean()).optional(),
  allergiesDetail: z.string().optional(),
  otherConditions: z.string().optional(),
  surgeryDetail: z.string().optional(),
});

const submitSchema = z
  .object({
    responsibleName: z.string().min(2, "Nombre del responsable obligatorio"),
    responsiblePhone: z.string().min(8, "Teléfono del responsable obligatorio"),
    lastName: z.string().min(1, "Apellido obligatorio"),
    firstName: z.string().min(1, "Nombres obligatorios"),
    gender: z.enum(["Varón", "Mujer"]),
    birthDate: z.string().min(1, "Fecha de nacimiento obligatoria"),
    dni: z.string().min(7, "DNI obligatorio"),
    address: z.string().min(3, "Dirección obligatoria"),
    department: z.enum([...EMPADRONAMIENTO_DEPARTMENTS] as [string, ...string[]]),
    locality: z.string().min(2, "Localidad obligatoria"),
    phone: z.string().min(8, "Teléfono obligatorio"),
    email: z.string().email("Correo electrónico inválido"),
    clubName: z.enum([...EMPADRONAMIENTO_CLUBS] as [string, ...string[]]),
    school: z.string().optional(),
    hasHandicap: z.boolean(),
    matricula: z.string().optional(),
    professors: z.array(z.enum([...EMPADRONAMIENTO_PROFESSORS] as [string, ...string[]])).default([]),
    professorOther: z.string().optional(),
    tutor1Name: z.string().min(2, "Nombre del tutor 1 obligatorio"),
    tutor1Dni: z.string().min(7, "DNI del tutor 1 obligatorio"),
    tutor1Phone: z.string().min(8, "Teléfono del tutor 1 obligatorio"),
    tutor1Email: z.string().email("Correo del tutor 1 inválido"),
    tutor2Name: z.string().optional(),
    tutor2Dni: z.string().optional(),
    tutor2Email: z.union([z.string().email(), z.literal("")]).optional(),
    healthData: healthSchema,
    comments: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasHandicap && !data.matricula?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Matrícula obligatoria si tiene Handicap",
        path: ["matricula"],
      });
    }
    if (data.professors.includes("Otro") && !data.professorOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Indicá el nombre del profesor",
        path: ["professorOther"],
      });
    }
    if (data.healthData.hasHealthInsurance) {
      if (!data.healthData.healthInsurance?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Obra social obligatoria",
          path: ["healthData", "healthInsurance"],
        });
      }
    }
    if (data.healthData.takesMedication && !data.healthData.medication?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Indicá la medicación",
        path: ["healthData", "medication"],
      });
    }
    const cond = data.healthData.conditions ?? {};
    if (cond.allergic && !data.healthData.allergiesDetail?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Especifique a qué es alérgico",
        path: ["healthData", "allergiesDetail"],
      });
    }
    if (cond.other && !data.healthData.otherConditions?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Describa otras condiciones",
        path: ["healthData", "otherConditions"],
      });
    }
    if (cond.recentSurgery && !data.healthData.surgeryDetail?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Indicá de qué fue operado",
        path: ["healthData", "surgeryDetail"],
      });
    }
  });

export async function checkYouthEnrollmentDni(dni: string) {
  const trimmed = dni.trim();
  if (trimmed.replace(/\D/g, "").length < 7) {
    return { enrolled: false as const };
  }
  return findYouthEnrollmentByDni(trimmed);
}

export async function submitYouthEnrollmentForm(raw: unknown) {
  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.errors[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  const clubs = await getEnrollmentClubCodes();
  const data = parsed.data;
  const tutor2Email =
    data.tutor2Email && data.tutor2Email.length > 0 ? data.tutor2Email : undefined;

  return submitYouthEnrollment(
    {
      ...data,
      tutor2Email,
      healthData: data.healthData as EmpadronamientoHealthData,
      professors: data.professors,
    },
    clubs
  );
}
