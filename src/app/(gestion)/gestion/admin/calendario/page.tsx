import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { listAdminCalendarSlots } from "@/lib/calendario-overrides";
import { CalendarioEditor } from "./CalendarioEditor";

export default async function AdminCalendarioPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "admin");

  const [mayores, menores] = await Promise.all([
    listAdminCalendarSlots("mayores"),
    listAdminCalendarSlots("menores"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/gestion/admin" className="text-sm font-medium text-[var(--feg-green-2)] hover:underline">
          ← Administración
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Calendario anual
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--feg-green)]">
          Cancelá, suspendé o reprogramá cualquier fecha. Los cambios se publican en el
          calendario de la web y quedan señalados como modificaciones.
        </p>
      </div>
      <CalendarioEditor mayores={mayores} menores={menores} />
    </div>
  );
}
