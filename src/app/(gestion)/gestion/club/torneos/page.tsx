import Link from "next/link";
import { auth } from "@/lib/auth";
import { getTournaments } from "@/lib/data";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";

export default async function GestionClubTorneosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "club");

  const clubId = session.user.clubId;
  const isAdmin = session.user.role === "ADMIN";

  const tournaments = await getTournaments({
    clubId,
    isAdmin,
  });

  return (
    <div>
      <h1 className="mb-6 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
        Torneos
      </h1>
      <div className="space-y-2">
        {tournaments.map((t) => (
          <Link
            key={t.id}
            href={`/gestion/club/torneos/${t.id}/scores`}
            className="block rounded-2xl border border-[var(--feg-green)]/12 bg-white p-4 shadow-sm transition hover:border-[var(--feg-green-2)]/35"
          >
            <div className="flex justify-between">
              <span className="font-medium text-[var(--feg-ink)]">{t.name}</span>
              <span className="text-sm text-[var(--feg-green)]">
                {new Date(t.date).toLocaleDateString("es-AR")} · {t.club.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
