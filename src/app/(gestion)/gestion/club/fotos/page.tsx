import { auth } from "@/lib/auth";
import { getTournaments } from "@/lib/data";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireGestionArea } from "@/lib/gestion-access";
import { UploadPhotoForm } from "./UploadPhotoForm";

export default async function FotosPage({
  searchParams,
}: {
  searchParams: Promise<{ torneoId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "club");
  if (session.user.role !== "CLUB" && session.user.role !== "ADMIN") {
    redirect("/auth/unauthorized");
  }

  const { torneoId } = await searchParams;
  const clubId = session.user.clubId;
  const isAdmin = session.user.role === "ADMIN";

  const tournamentsRaw = await getTournaments({
    clubId,
    isAdmin,
    limit: 50,
  });

  const tournaments = tournamentsRaw.map((t) => ({
    id: t.id,
    name: t.name,
    date: String(t.date),
  }));

  return (
    <div>
      <Link
        href="/gestion/club"
        className="mb-4 inline-flex text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
      >
        ← Volver a Club
      </Link>
      <h1 className="mb-2 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
        Enviar fotos
      </h1>
      <p className="mb-6 max-w-2xl text-[var(--feg-green)]">
        Subí fotos del torneo. Prensa las revisará y, si se aprueban, se
        mostrarán en la ficha pública del torneo.
      </p>
      <UploadPhotoForm
        tournaments={tournaments}
        defaultTournamentId={torneoId}
      />
    </div>
  );
}
