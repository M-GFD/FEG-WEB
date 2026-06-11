import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import Link from "next/link";

export default function InstitucionalPage() {
  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <BackToHome />

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[var(--feg-green)]/20 bg-white/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
              Federación
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-5xl">
              Nosotros
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[var(--feg-green)] sm:text-lg">
              La Federación Entrerriana de Golf es el organismo que nuclea y representa al golf organizado de la provincia,
              articulando clubes, competencias y jugadores bajo un mismo sistema.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <Link
              href="/institucional/directorio"
              className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
            >
              Directorio →
            </Link>
            <Link
              href="/institucional/reglamentos"
              className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
            >
              Reglamentos →
            </Link>
          </div>
        </header>

        <hr className="my-10 border-[var(--feg-green)]/10" />

        <div className="space-y-10">
          <section className="grid gap-6 border-t border-[var(--feg-green)]/10 pt-10 md:grid-cols-[200px_1fr] md:gap-10">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55">
              Objetivos
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
                Lo que nos proponemos
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--feg-green)]">
                <p>
                  La FEG tiene como misión central organizar, regular y promover el golf en el ámbito de la provincia de Entre
                  Ríos. Esto implica garantizar condiciones equitativas de competencia, mantener la integridad de los rankings
                  provinciales y asegurar la representación institucional de los clubes afiliados ante la Asociación Argentina de
                  Golf.
                </p>
                <p>
                  Nos comprometemos con la transparencia en la gestión de torneos y resultados, con el desarrollo del juego en
                  todas sus categorías —desde divisiones menores hasta el golf senior— y con el fortalecimiento de una comunidad
                  golfística activa y competitiva en toda la provincia.
                </p>
              </div>

              <div className="mt-6 grid overflow-hidden rounded-xl border border-[var(--feg-green)]/15 bg-white shadow-[0_20px_60px_rgba(0,36,3,0.08)] sm:grid-cols-3">
                <div className="border-b border-[var(--feg-green)]/10 p-5 sm:border-b-0 sm:border-r">
                  <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                    01
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--feg-ink)]">Regulación y transparencia</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-[var(--feg-green)]/85">
                    Gestión honesta de rankings, hándicaps y resultados.
                  </div>
                </div>
                <div className="border-b border-[var(--feg-green)]/10 p-5 sm:border-b-0 sm:border-r">
                  <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                    02
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--feg-ink)]">Representación institucional</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-[var(--feg-green)]/85">
                    Vínculo formal con la AAG y organismos nacionales.
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                    03
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--feg-ink)]">Desarrollo del deporte</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-[var(--feg-green)]/85">
                    Fomento del golf en todas las categorías y regiones.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 border-t border-[var(--feg-green)]/10 pt-10 md:grid-cols-[200px_1fr] md:gap-10">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55">
              Rol regional
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
                Golf en Entre Ríos
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--feg-green)]">
                <p>
                  Entre Ríos ocupa un lugar activo dentro del circuito federativo del golf argentino. La FEG actúa como nexo
                  entre los clubes de la provincia y el sistema nacional de competencias, coordinando el calendario anual de
                  torneos, gestionando la participación en el circuito interfederativo regional y representando a los jugadores
                  entrerrianos en instancias de selección.
                </p>
                <p>
                  La geografía provincial —con clubes distribuidos desde Concordia hasta Gualeguaychú, desde Paraná hasta Colón—
                  impone una lógica de coordinación que la federación sostiene a lo largo de todo el año, garantizando que ningún
                  rincón del circuito quede aislado del juego federado.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-[var(--feg-green)]/10 pt-6 sm:flex-row sm:gap-8">
                <div>
                  <div className="font-heading text-3xl font-semibold leading-none text-[var(--feg-green-2)]">8+</div>
                  <div className="mt-1 text-xs font-medium text-[var(--feg-green)]/70">Clubes afiliados</div>
                </div>
                <div>
                  <div className="font-heading text-3xl font-semibold leading-none text-[var(--feg-green-2)]">12</div>
                  <div className="mt-1 text-xs font-medium text-[var(--feg-green)]/70">Torneos anuales</div>
                </div>
                <div>
                  <div className="font-heading text-3xl font-semibold leading-none text-[var(--feg-green-2)]">300+</div>
                  <div className="mt-1 text-xs font-medium text-[var(--feg-green)]/70">Jugadores federados</div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 border-t border-[var(--feg-green)]/10 pt-10 md:grid-cols-[200px_1fr] md:gap-10">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55">
              Visión
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
                El golf que queremos construir
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--feg-green)]">
                <p>
                  Concebimos el golf entrerriano como un ecosistema en crecimiento: una comunidad de jugadores, clubes e
                  instituciones que se fortalece mutuamente. Nuestra visión es que Entre Ríos se consolide como una referencia
                  del golf regional en Argentina, con jugadores competitivos a nivel nacional y una estructura federativa moderna
                  que acompañe ese desarrollo.
                </p>
                <p>
                  A largo plazo, aspiramos a ampliar el acceso al deporte —especialmente entre jóvenes— y a construir las
                  condiciones para que el talento provincial pueda proyectarse más allá de las fronteras de la provincia. El
                  deporte organizado, cuando es bien gestionado, es también un camino de pertenencia e identidad.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
