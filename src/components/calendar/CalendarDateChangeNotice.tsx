import type { CalendarDateStatus } from "@/lib/calendario-feg";

type Copy = {
  cancelled: string;
  suspended: string;
  rescheduled: string;
  changeNotice: string;
};

const BADGE_CLASS: Record<Exclude<CalendarDateStatus, "SCHEDULED">, string> = {
  CANCELLED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-amber-100 text-amber-900",
  RESCHEDULED: "bg-[var(--feg-yellow)]/80 text-[var(--feg-ink)]",
};

export function CalendarDateChangeNotice({
  status,
  originalDateLabel,
  originalVenueLabel,
  note,
  copy,
  compact = false,
}: {
  status: CalendarDateStatus;
  originalDateLabel?: string | null;
  originalVenueLabel?: string | null;
  note: string | null;
  copy: Copy;
  compact?: boolean;
}) {
  if (status === "SCHEDULED") return null;

  const badge =
    status === "CANCELLED"
      ? copy.cancelled
      : status === "SUSPENDED"
        ? copy.suspended
        : copy.rescheduled;

  return (
    <div className={compact ? "mt-2 space-y-1" : "mt-1.5 space-y-1"}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            compact ? "bg-[var(--feg-yellow)] text-[var(--feg-ink)]" : BADGE_CLASS[status]
          }`}
        >
          {badge}
        </span>
        {!compact ? (
          <span className="text-[11px] font-medium text-[var(--feg-green-2)]">{copy.changeNotice}</span>
        ) : null}
      </div>
      {originalDateLabel ? (
        <p className={compact ? "text-[11px] text-white/75" : "text-xs text-[var(--feg-green)]"}>
          {originalDateLabel}
        </p>
      ) : null}
      {originalVenueLabel ? (
        <p className={compact ? "text-[11px] text-white/75" : "text-xs text-[var(--feg-green)]"}>
          {originalVenueLabel}
        </p>
      ) : null}
      {note ? (
        <p className={compact ? "text-[11px] text-white/90" : "text-xs text-[var(--feg-ink)]"}>{note}</p>
      ) : null}
    </div>
  );
}
