"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  deleteCalendarDateOverride,
  findOriginalCalendarSlot,
  saveCalendarDateOverride,
} from "@/lib/calendario-overrides";
import { tournamentKeyFromCalendarEntry } from "@/lib/inscripcion-torneos-menores/signup-window";
import type { CalendarDateStatus } from "@/lib/calendario-feg";

const schema = z.object({
  slotId: z.string().min(1),
  status: z.enum(["SCHEDULED", "RESCHEDULED", "SUSPENDED", "CANCELLED"]),
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),
  rangeStyle: z.enum(["and", "slash"]).optional(),
  sede: z.string().max(120).optional(),
  note: z.string().max(500).optional(),
});

function revalidateCalendarSurfaces() {
  revalidatePath("/");
  revalidatePath("/calendario");
  revalidatePath("/inscripcion-torneos-menores");
  revalidatePath("/torneos");
  revalidatePath("/gestion/admin/calendario");
  revalidatePath("/gestion/admin/inscripcion-torneos-menores");
}

async function deactivateYouthSignupForSlot(slotId: string, status: CalendarDateStatus) {
  if (status !== "CANCELLED" && status !== "SUSPENDED") return;
  const found = findOriginalCalendarSlot(slotId);
  if (!found || found.segment !== "menores") return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const tournamentKey = tournamentKeyFromCalendarEntry(found.original);
  await supabase
    .from("YouthTournamentSignupConfig")
    .update({ isActive: false, updatedAt: new Date().toISOString() })
    .eq("tournamentKey", tournamentKey);
}

export async function saveCalendarDateAction(input: z.infer<typeof schema>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "No autorizado" };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Datos inválidos" };
  }

  const result = await saveCalendarDateOverride(parsed.data);
  if (!result.ok) return result;

  await deactivateYouthSignupForSlot(parsed.data.slotId, parsed.data.status);
  revalidateCalendarSurfaces();
  return { ok: true as const };
}

export async function restoreCalendarDateAction(slotId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "No autorizado" };
  }
  if (!slotId.trim()) {
    return { ok: false as const, error: "Fecha no válida" };
  }

  const result = await deleteCalendarDateOverride(slotId);
  if (!result.ok) return result;

  revalidateCalendarSurfaces();
  return { ok: true as const };
}
