import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";

export default async function GestionDirectorioPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "directorio");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Directorio
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--feg-green)]">
          Consultá el ranking y la actividad pública de la federación. Las operaciones de
          torneos del club están en{" "}
          <Link
            href="/gestion/club/torneos"
            className="font-semibold text-[var(--feg-green-2)] underline underline-offset-2"
          >
            Torneos y resultados
          </Link>
          .
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            href="/ranking"
            className="block rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_10px_30px_rgba(0,36,3,0.06)] transition hover:border-[var(--feg-green-2)]/35"
          >
            <span className="font-heading font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
              Ranking
            </span>
            <p className="mt-1 text-sm text-[var(--feg-green)]">
              Posiciones y puntos del año en curso.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/torneos"
            className="block rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_10px_30px_rgba(0,36,3,0.06)] transition hover:border-[var(--feg-green-2)]/35"
          >
            <span className="font-heading font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
              Histórico de torneos
            </span>
            <p className="mt-1 text-sm text-[var(--feg-green)]">
              Torneos publicados y resultados.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/noticias"
            className="block rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_10px_30px_rgba(0,36,3,0.06)] transition hover:border-[var(--feg-green-2)]/35"
          >
            <span className="font-heading font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
              Noticias
            </span>
            <p className="mt-1 text-sm text-[var(--feg-green)]">Novedades de la FEG.</p>
          </Link>
        </li>
        <li>
          <Link
            href="/prensa"
            className="block rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_10px_30px_rgba(0,36,3,0.06)] transition hover:border-[var(--feg-green-2)]/35"
          >
            <span className="font-heading font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
              Prensa · galería
            </span>
            <p className="mt-1 text-sm text-[var(--feg-green)]">Fotografía aprobada.</p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
