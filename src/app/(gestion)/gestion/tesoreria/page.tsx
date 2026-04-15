import { auth } from "@/lib/auth";
import { getPendingExpenses } from "@/lib/data";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { ExpenseList } from "./ExpenseList";

export default async function TesoreriaPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "tesoreria");
  const pendingExpenses = await getPendingExpenses();

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
        Tesorería
      </h1>
      <h2 className="mb-4 font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
        Gastos pendientes
      </h2>
      <ExpenseList expenses={pendingExpenses} />
    </div>
  );
}
