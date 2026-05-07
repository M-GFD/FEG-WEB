import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireGestionArea } from "@/lib/gestion-access";
import { NotificationCreateForm } from "./NotificationCreateForm";

export default async function NuevaNotificacionPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "prensa");

  return (
    <div className="space-y-6">
      <Link
        href="/gestion/prensa"
        className="inline-flex text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
      >
        ← Volver a prensa
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Nueva notificación
        </h1>
        <p className="mt-1 text-sm text-[var(--feg-green)]">
          El aviso aparece en el menú del sitio (sobre ✉️) para usuarios registrados.
        </p>
      </div>

      <NotificationCreateForm />
    </div>
  );
}
