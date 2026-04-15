"use client";

import { useTransition } from "react";
import { approveExpense, rejectExpense, markPaid } from "./actions";

type Expense = {
  id: string;
  amount: number;
  description: string;
  status: string;
  club: { name: string };
};

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const [isPending, startTransition] = useTransition();

  if (expenses.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
        No hay gastos pendientes.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((e) => (
        <div
          key={e.id}
          className="flex items-center justify-between rounded-2xl border border-[var(--feg-green)]/12 bg-white p-4 shadow-sm"
        >
          <div>
            <p className="font-medium text-[var(--feg-ink)]">{e.description}</p>
            <p className="text-sm text-[var(--feg-green)]">
              {e.club.name} · ${e.amount.toLocaleString("es-AR")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                startTransition(() => approveExpense(e.id))
              }
              disabled={isPending}
              className="rounded-xl bg-[var(--feg-green-2)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
            >
              Aprobar
            </button>
            <button
              type="button"
              onClick={() =>
                startTransition(() => rejectExpense(e.id))
              }
              disabled={isPending}
              className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={() =>
                startTransition(() => markPaid(e.id))
              }
              disabled={isPending}
              className="rounded-xl border border-[var(--feg-green)]/15 bg-[var(--feg-bg)] px-4 py-2 text-sm font-semibold text-[var(--feg-ink)] hover:bg-white disabled:opacity-50"
            >
              Marcar pagado
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
