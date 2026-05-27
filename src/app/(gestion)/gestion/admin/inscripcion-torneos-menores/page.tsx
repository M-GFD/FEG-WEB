import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { getActiveYouthTournamentConfig } from "@/lib/inscripcion-torneos-menores/config";
import { getUpcomingFegDatesForAudience } from "@/lib/calendario-feg";
import { TorneoActivoForm } from "./TorneoActivoForm";

export default async function AdminInscripcionTorneosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "admin");

  const config = await getActiveYouthTournamentConfig();
  const nextCal = getUpcomingFegDatesForAudience("menores", 1)[0];

  const initial = config
    ? {
        title: config.title,
        dateLabel: config.dateLabel,
        extraLine: config.extraLine ?? "",
        venue: config.venue,
        fecha: config.fecha,
        sede: config.sede,
        modalidad: config.modalidad,
      }
    : nextCal
      ? {
          title: nextCal.modalidad,
          dateLabel: nextCal.fecha,
          extraLine: "",
          venue: nextCal.sede,
          fecha: nextCal.fecha,
          sede: nextCal.sede,
          modalidad: nextCal.modalidad,
        }
      : {
          title: "",
          dateLabel: "",
          extraLine: "",
          venue: "",
          fecha: "",
          sede: "",
          modalidad: "",
        };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/gestion/admin" className="text-sm font-medium text-[var(--feg-green-2)] hover:underline">
          ← Administración
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Inscripción torneos menores
        </h1>
        <p className="mt-2 text-[var(--feg-green)]">
          Configurá el encabezado del torneo con inscripciones abiertas (página pública y formulario).
        </p>
      </div>
      <TorneoActivoForm initial={initial} />
    </div>
  );
}
