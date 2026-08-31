import { cache } from "react";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { AudienceSegment } from "@/lib/content-audience";
import type { AppLocale } from "@/i18n/routing";
import {
  calendarRawToIsoDate,
  calendarSlotId,
  formatCalendarDate,
  getCalendarEntriesRawForAudience,
  getCalendarTableRawForAudience,
  getSpanishCalendarLabels,
  isActiveCalendarStatus,
  isMenoresCalendarModality,
  isoDateToCalendarParts,
  localizeCalendarEntry,
  pickUpcomingRaws,
  type CalendarDateStatus,
  type CalendarEntryRaw,
  type CalendarLabels,
  type HomeCalendarCardDto,
} from "@/lib/calendario-feg";

export type CalendarDateOverrideRow = {
  id: string;
  status: CalendarDateStatus;
  month: number | null;
  day: number | null;
  dayEnd: number | null;
  rangeStyle: string | null;
  year: number | null;
  sede: string | null;
  note: string | null;
};

export type ResolvedCalendarEntry = {
  slotId: string;
  segment: AudienceSegment;
  original: CalendarEntryRaw;
  display: CalendarEntryRaw;
  status: CalendarDateStatus;
  note: string | null;
};

export type ResolvedCalendarTableRow = ResolvedCalendarEntry & {
  num: string;
};

export type AdminCalendarSlot = {
  slotId: string;
  segment: AudienceSegment;
  num: string;
  original: CalendarEntryRaw;
  display: CalendarEntryRaw;
  status: CalendarDateStatus;
  note: string | null;
  originalFecha: string;
  displayFecha: string;
  originalSede: string;
  displaySede: string;
  modalidad: string;
  dateStartIso: string;
  dateEndIso: string;
  rangeStyle: "and" | "slash";
};

const STATUSES = new Set<CalendarDateStatus>([
  "SCHEDULED",
  "RESCHEDULED",
  "SUSPENDED",
  "CANCELLED",
]);

function asStatus(value: unknown): CalendarDateStatus {
  return typeof value === "string" && STATUSES.has(value as CalendarDateStatus)
    ? (value as CalendarDateStatus)
    : "SCHEDULED";
}

export const loadCalendarOverrideMap = cache(async function loadCalendarOverrideMap(): Promise<
  Map<string, CalendarDateOverrideRow>
> {
  const map = new Map<string, CalendarDateOverrideRow>();
  const supabase = getSupabaseAdmin();
  if (!supabase) return map;

  const { data, error } = await supabase.from("CalendarDateOverride").select(
    "id,status,month,day,dayEnd,rangeStyle,year,sede,note"
  );

  if (error) {
    console.error("[loadCalendarOverrideMap]", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const id = typeof row.id === "string" ? row.id : "";
    if (!id) continue;
    map.set(id, {
      id,
      status: asStatus(row.status),
      month: typeof row.month === "number" ? row.month : null,
      day: typeof row.day === "number" ? row.day : null,
      dayEnd: typeof row.dayEnd === "number" ? row.dayEnd : null,
      rangeStyle: typeof row.rangeStyle === "string" ? row.rangeStyle : null,
      year: typeof row.year === "number" ? row.year : null,
      sede: typeof row.sede === "string" ? row.sede : null,
      note: typeof row.note === "string" ? row.note : null,
    });
  }

  return map;
});

function applyReschedule(original: CalendarEntryRaw, row: CalendarDateOverrideRow): CalendarEntryRaw {
  const month = row.month ?? original.month;
  const day = row.day ?? original.day;
  const year = row.year ?? original.year;
  const sede = row.sede?.trim() || original.sede;
  const dayEnd = row.dayEnd == null ? undefined : row.dayEnd;
  const rangeStyle: CalendarEntryRaw["rangeStyle"] =
    dayEnd != null && dayEnd !== day ? (row.rangeStyle === "slash" ? "slash" : "and") : undefined;
  return {
    ...original,
    month,
    day,
    year,
    sede,
    dayEnd,
    rangeStyle,
    venueKey: sede === original.sede ? original.venueKey : undefined,
  };
}

export function resolveCalendarEntry(
  segment: AudienceSegment,
  original: CalendarEntryRaw,
  override: CalendarDateOverrideRow | undefined
): ResolvedCalendarEntry {
  const slotId = calendarSlotId(segment, original);
  if (!override || override.status === "SCHEDULED") {
    return {
      slotId,
      segment,
      original,
      display: original,
      status: "SCHEDULED",
      note: null,
    };
  }

  const note = override.note?.trim() || null;
  if (override.status === "CANCELLED" || override.status === "SUSPENDED") {
    return { slotId, segment, original, display: original, status: override.status, note };
  }

  return {
    slotId,
    segment,
    original,
    display: applyReschedule(original, override),
    status: "RESCHEDULED",
    note,
  };
}

export async function getResolvedCalendarEntries(
  segment: AudienceSegment
): Promise<ResolvedCalendarEntry[]> {
  const overrides = await loadCalendarOverrideMap();
  return getCalendarEntriesRawForAudience(segment).map((original) =>
    resolveCalendarEntry(segment, original, overrides.get(calendarSlotId(segment, original)))
  );
}

export async function getResolvedCalendarTable(
  segment: AudienceSegment
): Promise<ResolvedCalendarTableRow[]> {
  const overrides = await loadCalendarOverrideMap();
  return getCalendarTableRawForAudience(segment).map((row) => ({
    num: row.num,
    ...resolveCalendarEntry(segment, row, overrides.get(calendarSlotId(segment, row))),
  }));
}

function calendarDatesEqual(a: CalendarEntryRaw, b: CalendarEntryRaw): boolean {
  return (
    (a.year ?? null) === (b.year ?? null) &&
    a.month === b.month &&
    a.day === b.day &&
    (a.dayEnd ?? a.day) === (b.dayEnd ?? b.day)
  );
}

export function toHomeCalendarCard(
  entry: ResolvedCalendarEntry,
  locale: AppLocale,
  labels: CalendarLabels
): HomeCalendarCardDto {
  const display = localizeCalendarEntry(entry.display, locale, labels);
  const original = localizeCalendarEntry(entry.original, locale, labels);
  const datesChanged = !calendarDatesEqual(entry.original, entry.display);
  const sedeChanged = display.sede !== original.sede;
  return {
    fecha: display.fecha,
    sede: display.sede,
    modalidad: display.modalidad,
    isMenores: isMenoresCalendarModality(entry.display.modalityKey),
    status: entry.status,
    originalFecha: datesChanged ? original.fecha : null,
    originalSede: sedeChanged ? original.sede : null,
    note: entry.note,
  };
}

export async function getHomeUpcomingCards(
  locale: AppLocale,
  labels: CalendarLabels,
  count: number,
  now: Date = new Date()
): Promise<HomeCalendarCardDto[]> {
  const [mayores, menores] = await Promise.all([
    getResolvedCalendarEntries("mayores"),
    getResolvedCalendarEntries("menores"),
  ]);
  const active = [...mayores, ...menores].filter((e) => isActiveCalendarStatus(e.status));
  const picked = pickUpcomingRaws(
    active.map((e) => e.display),
    count,
    now
  );
  return picked.flatMap((raw) => {
    const entry = active.find((e) => e.display === raw);
    return entry ? [toHomeCalendarCard(entry, locale, labels)] : [];
  });
}

export async function getUpcomingResolvedForAudience(
  segment: AudienceSegment,
  count: number,
  now: Date = new Date()
): Promise<ResolvedCalendarEntry[]> {
  const resolved = (await getResolvedCalendarEntries(segment)).filter((e) =>
    isActiveCalendarStatus(e.status)
  );
  const picked = pickUpcomingRaws(
    resolved.map((e) => e.display),
    count,
    now
  );
  return picked.flatMap((raw) => {
    const entry = resolved.find((e) => e.display === raw);
    return entry ? [entry] : [];
  });
}

export async function listAdminCalendarSlots(segment: AudienceSegment): Promise<AdminCalendarSlot[]> {
  const rows = await getResolvedCalendarTable(segment);
  const labels = getSpanishCalendarLabels();
  return rows.map((row) => {
    const original = localizeCalendarEntry(row.original, "es", labels);
    const display = localizeCalendarEntry(row.display, "es", labels);
    return {
      slotId: row.slotId,
      segment: row.segment,
      num: row.num,
      original: row.original,
      display: row.display,
      status: row.status,
      note: row.note,
      originalFecha: formatCalendarDate(row.original, "es"),
      displayFecha: formatCalendarDate(row.display, "es"),
      originalSede: original.sede,
      displaySede: display.sede,
      modalidad: original.modalidad,
      dateStartIso: calendarRawToIsoDate(row.display, "start"),
      dateEndIso: calendarRawToIsoDate(row.display, "end"),
      rangeStyle: row.display.rangeStyle === "slash" ? "slash" : "and",
    };
  });
}

export function findOriginalCalendarSlot(
  slotId: string
): { segment: AudienceSegment; original: CalendarEntryRaw } | null {
  for (const segment of ["mayores", "menores"] as const) {
    for (const raw of getCalendarTableRawForAudience(segment)) {
      if (calendarSlotId(segment, raw) === slotId) {
        return { segment, original: raw };
      }
    }
  }
  return null;
}

export type SaveCalendarOverrideInput = {
  slotId: string;
  status: CalendarDateStatus;
  dateStart?: string;
  dateEnd?: string;
  rangeStyle?: "and" | "slash";
  sede?: string;
  note?: string;
};

export async function saveCalendarDateOverride(
  input: SaveCalendarOverrideInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const found = findOriginalCalendarSlot(input.slotId);
  if (!found) {
    return { ok: false, error: "Fecha del calendario no encontrada" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Base de datos no disponible" };
  }

  if (input.status === "SCHEDULED") {
    const { error } = await supabase.from("CalendarDateOverride").delete().eq("id", input.slotId);
    if (error) {
      console.error("[saveCalendarDateOverride] delete", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  const now = new Date().toISOString();
  const note = input.note?.trim() || null;
  let month: number | null = null;
  let day: number | null = null;
  let dayEnd: number | null = null;
  let rangeStyle: string | null = null;
  let year: number | null = null;
  let sede: string | null = null;

  if (input.status === "RESCHEDULED") {
    const start = input.dateStart ? isoDateToCalendarParts(input.dateStart) : null;
    if (!start) {
      return { ok: false, error: "Indicá la nueva fecha" };
    }
    month = start.month;
    day = start.day;
    year = start.year;
    sede = input.sede?.trim() || found.original.sede;

    if (input.dateEnd?.trim()) {
      const end = isoDateToCalendarParts(input.dateEnd);
      if (!end) {
        return { ok: false, error: "La fecha de fin no es válida" };
      }
      if (end.year !== start.year || end.month !== start.month) {
        return { ok: false, error: "El rango debe ser del mismo mes" };
      }
      if (end.day === start.day) {
        dayEnd = null;
        rangeStyle = null;
      } else {
        dayEnd = end.day;
        rangeStyle = input.rangeStyle === "slash" ? "slash" : "and";
      }
    }
  }

  const { error } = await supabase.from("CalendarDateOverride").upsert(
    {
      id: input.slotId,
      status: input.status,
      month,
      day,
      dayEnd,
      rangeStyle,
      year,
      sede,
      note,
      updatedAt: now,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[saveCalendarDateOverride] upsert", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function deleteCalendarDateOverride(
  slotId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  return saveCalendarDateOverride({ slotId, status: "SCHEDULED" });
}
