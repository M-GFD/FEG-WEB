import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getEnrollmentClubCodes } from "@/lib/empadronamiento-menores/persistence";
import { EMPADRONAMIENTO_SEASON_YEAR } from "@/lib/empadronamiento-menores/constants";
import { EmpadronamientoMenoresForm } from "./EmpadronamientoMenoresForm";

export const metadata = {
  title: "Empadronamiento Menores | FEG",
  description:
    "Formulario de empadronamiento para jugadores menores y juveniles — temporada 2026.",
};

export default async function EmpadronamientoMenoresPage() {
  const clubCodes = await getEnrollmentClubCodes();

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
        <BackToHome />

        <header className="mt-6">
          <p className="inline-flex rounded-full border border-[var(--feg-green)]/20 bg-white/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Menores y juveniles
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-4xl">
            Empadronamiento {EMPADRONAMIENTO_SEASON_YEAR}
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-[var(--feg-green)]">
            Completá el formulario para jugadores menores interesados en participar en las
            actividades y competencias de la Federación Entrerriana de Golf en la temporada{" "}
            {EMPADRONAMIENTO_SEASON_YEAR}. Los datos quedan registrados de forma confidencial en
            el padrón de menores empadronados de la plataforma.
          </p>
        </header>

        <div className="mt-10">
          <EmpadronamientoMenoresForm clubCodes={clubCodes} />
        </div>
      </main>
    </div>
  );
}
