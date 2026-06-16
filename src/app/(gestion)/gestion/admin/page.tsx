import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";

export default async function GestionAdminHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "admin");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Administración
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--feg-green)]">
          Gestión de torneos y cuentas de la federación.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Torneos
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/gestion/admin/torneos"
            className="inline-flex rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Crear torneo
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Menores
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/gestion/admin/inscripcion-torneos-menores"
            className="inline-flex rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Torneo activo (inscripciones)
          </Link>
          <Link
            href="/gestion/admin/empadronados"
            className="inline-flex rounded-xl border border-[var(--feg-green)]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)]"
          >
            Jugadores empadronados
          </Link>
          <Link
            href="/gestion/admin/inscriptos"
            className="inline-flex rounded-xl border border-[var(--feg-green)]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)]"
          >
            Inscriptos a torneos
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Reglamento
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/gestion/admin/reglamento-videos"
            className="inline-flex rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Publicar video explicativo
          </Link>
          <Link
            href="/gestion/admin/reglamento-videos/eliminar"
            className="inline-flex rounded-xl border border-[var(--feg-green)]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)]"
          >
            Eliminar videos publicados
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Usuarios
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/gestion/admin/usuarios?role=ADMIN"
            className="inline-flex rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Crear usuario admin
          </Link>
          <Link
            href="/gestion/admin/usuarios?role=CLUB"
            className="inline-flex rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Crear usuario club
          </Link>
          <Link
            href="/gestion/admin/usuarios?role=PRESS"
            className="inline-flex rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Crear usuario prensa
          </Link>
          <Link
            href="/gestion/admin/usuarios?role=TREASURER"
            className="inline-flex rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Crear usuario tesorería
          </Link>
        </div>
      </section>
    </div>
  );
}
