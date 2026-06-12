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
    responsibleName: z.string().min(2, "responsibleNameRequired"),
    responsiblePhone: z.string().min(8, "responsiblePhoneRequired"),
    lastName: z.string().min(1, "lastNameRequired"),
    firstName: z.string().min(1, "firstNameRequired"),
    gender: z.enum(["Varón", "Mujer"]),
    birthDate: z.string().min(1, "birthDateRequired"),
    dni: z.string().min(7, "dniRequired"),
    address: z.string().min(3, "addressRequired"),
    department: z.enum([...EMPADRONAMIENTO_DEPARTMENTS] as [string, ...string[]]),
    locality: z.string().min(2, "localityRequired"),
    phone: z.string().min(8, "phoneRequired"),
    email: z.string().email("emailInvalid"),
    clubName: z.enum([...EMPADRONAMIENTO_CLUBS] as [string, ...string[]]),
    school: z.string().optional(),
    hasHandicap: z.boolean(),
    matricula: z.string().optional(),
    professors: z.array(z.enum([...EMPADRONAMIENTO_PROFESSORS] as [string, ...string[]])).default([]),
    professorOther: z.string().optional(),
    tutor1Name: z.string().min(2, "tutor1NameRequired"),
    tutor1Dni: z.string().min(7, "tutor1DniRequired"),
    tutor1Phone: z.string().min(8, "tutor1PhoneRequired"),
    tutor1Email: z.string().email("tutor1EmailInvalid"),
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
        message: "matriculaRequired",
        path: ["matricula"],
      });
    }
    if (data.professors.includes("Otro") && !data.professorOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "professorOtherRequired",
        path: ["professorOther"],
      });
    }
    if (data.healthData.hasHealthInsurance) {
      if (!data.healthData.healthInsurance?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "healthInsuranceRequired",
          path: ["healthData", "healthInsurance"],
        });
      }
    }
    if (data.healthData.takesMedication && !data.healthData.medication?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "medicationRequired",
        path: ["healthData", "medication"],
      });
    }
    const cond = data.healthData.conditions ?? {};
    if (cond.allergic && !data.healthData.allergiesDetail?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "allergiesRequired",
        path: ["healthData", "allergiesDetail"],
      });
    }
    if (cond.other && !data.healthData.otherConditions?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "otherConditionsRequired",
        path: ["healthData", "otherConditions"],
      });
    }
    if (cond.recentSurgery && !data.healthData.surgeryDetail?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "surgeryRequired",
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
      errorKey: parsed.error.errors[0]?.message ?? "invalidForm",
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
