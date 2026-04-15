"use client";

import { useActionState } from "react";
import { saveScorecard } from "./actions";
import { Button } from "@/components/ui/button";

const HOLES = Array.from({ length: 18 }, (_, i) => i + 1);

type Entry = {
  id: string;
  player: { handicap: number };
  scorecard: {
    h1: number | null;
    h2: number | null;
    h3: number | null;
    h4: number | null;
    h5: number | null;
    h6: number | null;
    h7: number | null;
    h8: number | null;
    h9: number | null;
    h10: number | null;
    h11: number | null;
    h12: number | null;
    h13: number | null;
    h14: number | null;
    h15: number | null;
    h16: number | null;
    h17: number | null;
    h18: number | null;
    gross: number | null;
  } | null;
};

export function ScoreEntryForm({ entry }: { entry: Entry }) {
  const sc = entry.scorecard;
  const initial = {
    h1: sc?.h1 ?? "",
    h2: sc?.h2 ?? "",
    h3: sc?.h3 ?? "",
    h4: sc?.h4 ?? "",
    h5: sc?.h5 ?? "",
    h6: sc?.h6 ?? "",
    h7: sc?.h7 ?? "",
    h8: sc?.h8 ?? "",
    h9: sc?.h9 ?? "",
    h10: sc?.h10 ?? "",
    h11: sc?.h11 ?? "",
    h12: sc?.h12 ?? "",
    h13: sc?.h13 ?? "",
    h14: sc?.h14 ?? "",
    h15: sc?.h15 ?? "",
    h16: sc?.h16 ?? "",
    h17: sc?.h17 ?? "",
    h18: sc?.h18 ?? "",
  };

  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      return saveScorecard(formData);
    },
    null as { ok: boolean; message?: string; error?: string } | null
  );

  const strokes = HOLES.map((h) => {
    const v = (initial as Record<string, string | number>)[`h${h}`];
    return typeof v === "number" ? v : parseInt(String(v) || "0", 10) || 0;
  });
  const total = strokes.reduce((a, b) => a + b, 0);
  const net =
    total > 0
      ? total - Math.floor(entry.player.handicap * 0.9)
      : 0;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="entryId" value={entry.id} />

      <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-white p-4 shadow-sm">
        <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-ink)]">
          Ida (1-9)
        </h3>
        <div className="grid grid-cols-9 gap-2">
          {HOLES.slice(0, 9).map((h) => (
            <div key={h}>
              <label className="mb-1 block text-xs text-[var(--feg-green)]/80">H{h}</label>
              <input
                type="number"
                name={`h${h}`}
                min={1}
                max={15}
                defaultValue={initial[`h${h}` as keyof typeof initial] || ""}
                className="w-full rounded-lg border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-2 py-1.5 text-center text-sm text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-white p-4 shadow-sm">
        <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-ink)]">
          Vuelta (10-18)
        </h3>
        <div className="grid grid-cols-9 gap-2">
          {HOLES.slice(9, 18).map((h) => (
            <div key={h}>
              <label className="mb-1 block text-xs text-[var(--feg-green)]/80">H{h}</label>
              <input
                type="number"
                name={`h${h}`}
                min={1}
                max={15}
                defaultValue={initial[`h${h}` as keyof typeof initial] || ""}
                className="w-full rounded-lg border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-2 py-1.5 text-center text-sm text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 rounded-2xl border border-[var(--feg-green)]/12 bg-[var(--feg-bg)] p-4">
        <div>
          <span className="text-sm text-[var(--feg-green)]">Total: </span>
          <span className="font-semibold text-[var(--feg-ink)]">{total || "-"}</span>
        </div>
        <div>
          <span className="text-sm text-[var(--feg-green)]">Neto: </span>
          <span className="font-semibold text-[var(--feg-ink)]">{total > 0 ? net : "-"}</span>
        </div>
      </div>

      {state?.error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.ok && state?.message && (
        <p className="rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
          {state.message}
        </p>
      )}

      <div className="flex gap-4">
        <Button type="submit" variant="primary">
          Guardar borrador
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Volver
        </Button>
      </div>
    </form>
  );
}
