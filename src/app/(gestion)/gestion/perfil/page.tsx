import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { PerfilChangePassword } from "./PerfilChangePassword";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  PRESS: "Prensa",
  CLUB: "Club",
  DIRECTOR: "Director",
  TREASURER: "Tesorería",
  PUBLIC: "Público",
};

export default async function GestionPerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "perfil");

  const u = session.user;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
        Mis datos
      </h1>
      <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.06)]">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-medium text-[var(--feg-green)]/80">Email</dt>
            <dd className="text-[var(--feg-ink)]">{u.email}</dd>
          </div>
          {u.name && (
            <div>
              <dt className="font-medium text-[var(--feg-green)]/80">Nombre</dt>
              <dd className="text-[var(--feg-ink)]">{u.name}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-[var(--feg-green)]/80">Rol</dt>
            <dd className="text-[var(--feg-ink)]">
              {roleLabels[u.role] ?? u.role}
            </dd>
          </div>
          {u.clubId && (
            <div>
              <dt className="font-medium text-[var(--feg-green)]/80">Club (ID)</dt>
              <dd className="font-mono text-xs text-[var(--feg-green)]">{u.clubId}</dd>
            </div>
          )}
        </dl>
      </div>

      <PerfilChangePassword />
    </div>
  );
}
