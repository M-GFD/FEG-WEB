import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import Link from "next/link";

export default function InstitucionalPage() {
  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <BackToHome />

        <header className="mt-6 max-w-3xl">
          <p className="inline-flex rounded-full border border-[var(--feg-green)]/20 bg-white/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Federación
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-5xl">
            Institucional
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[var(--feg-green)] sm:text-lg">
            La Federación Entrerriana de Golf es el organismo que nuclea y representa al golf organizado de la provincia,
            articulando clubes, competencias y jugadores bajo un mismo sistema.
          </p>
        </header>

        <hr className="my-10 border-[var(--feg-green)]/10" />

        <div className="space-y-10">
          <section className="grid gap-6 border-t border-[var(--feg-green)]/10 pt-10 md:grid-cols-[200px_1fr] md:gap-10">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55">
              Objetivos
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
                Qué nos proponemos
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

              <div className="mt-6 rounded-2xl border border-[var(--feg-green)]/15 bg-[var(--feg-green-2)]/5 p-5">
                <p className="font-heading text-lg italic leading-relaxed text-[var(--feg-ink)]/80">
                  “Que cada jugador entrerriano, sin importar el club ni la ciudad, tenga las mismas posibilidades de competir,
                  crecer y representar a la provincia.”
                </p>
              </div>

              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
                >
                  Volver al inicio →
                </Link>
              </div>
            </div>
          </section>

          <section
            id="reglamento"
            className="scroll-mt-28 grid gap-6 border-t border-[var(--feg-green)]/10 pt-10 lg:scroll-mt-24 md:grid-cols-[200px_1fr] md:gap-10"
          >
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55">
              Reglamento
            </div>
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
                    Ranking Argentino de Juveniles y Prejuveniles 2026
                  </h2>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--feg-green)]">
                    Lineamientos y metodología de competencias computables, cupos, criterios de asignación e inscripciones.
                  </p>
                </div>
                <Link
                  href="/reglamento-ranking-juveniles-prejuveniles-2026.pdf"
                  download
                  className="shrink-0 inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
                >
                  Descargar PDF →
                </Link>
              </div>

              <div className="mt-6 space-y-8 text-[15px] leading-relaxed text-[var(--feg-green)]">
                <div>
                  <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">Competencias computables</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    <li>
                      <span className="font-semibold text-[var(--feg-ink)]">Torneos Nacionales</span>: cuatro torneos a 54 hoyos
                      con categorías en Mujeres y Varones.
                    </li>
                    <li>
                      <span className="font-semibold text-[var(--feg-ink)]">General</span>: Juveniles (Menores) y Prejuveniles
                      (M15) conjuntamente. Puntaje WAGR.
                    </li>
                    <li>
                      <span className="font-semibold text-[var(--feg-ink)]">Juveniles</span>: clases 2008-2009-2010 en 2026.
                    </li>
                    <li>
                      <span className="font-semibold text-[var(--feg-ink)]">Prejuveniles</span>: clases 2011 a 2016 en 2026.
                    </li>
                  </ul>

                  <div className="mt-4 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                      Fechas y sedes (Torneos Nacionales)
                    </p>
                    <ul className="mt-3 space-y-2">
                      <li>
                        <span className="font-semibold text-[var(--feg-ink)]">13 al 15 de marzo</span> — F.R.G. Sur, Golf Club
                        Sierra de la Ventana
                      </li>
                      <li>
                        <span className="font-semibold text-[var(--feg-ink)]">15 al 17 de mayo</span> — F.R.G. Mar y Sierras, Costa
                        Esmeralda Golf &amp; Links
                      </li>
                      <li>
                        <span className="font-semibold text-[var(--feg-ink)]">7 al 9 de agosto</span> — Federación del Sur del
                        Litoral, club sede a confirmar
                      </li>
                      <li>
                        <span className="font-semibold text-[var(--feg-ink)]">11 al 13 de septiembre</span> — federación y club sede
                        a confirmar
                      </li>
                    </ul>
                  </div>

                  <p className="mt-4">
                    <span className="font-semibold text-[var(--feg-ink)]">Campeonato Argentino de Juveniles y Prejuveniles</span>:
                    2 al 4 de octubre (Federación de Golf de Pcia. de Córdoba, club a designar), de acuerdo a reglamentación propia.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">Field y corte</h3>
                  <p className="mt-2">
                    Field máximo de <span className="font-semibold text-[var(--feg-ink)]">120 jugadores/as</span> en cada torneo
                    nacional. En los torneos nacionales se implementará un corte clasificatorio por categoría tras 36 hoyos, para
                    permitir un esquema de 13 salidas desde los hoyos 1 y 10 y facilitar el cierre temprano o la recuperación de hoyos
                    pendientes.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">Cupos por federación</h3>
                  <p className="mt-2">
                    Los cupos se establecen según el ordenamiento final del Ranking Argentino 2025 por regiones, ponderando puntos
                    obtenidos en torneos nacionales (no regionales), considerando a la clase 2010 (pasa a Juveniles) y excluyendo clase
                    2007. Se otorga un cupo mínimo de 1 cuando no hubiera puntaje, y para Prejuveniles se calculan cupos adicionales por
                    performances en el Torneo Nacional Junior 2025. Los cupos son <span className="font-semibold text-[var(--feg-ink)]">innominados</span>.
                  </p>

                  <div className="mt-4 rounded-2xl border border-[var(--feg-green)]/12 bg-[var(--feg-bg)] p-4">
                    <p className="text-sm font-semibold text-[var(--feg-ink)]">Cuadro de cupos (extracto del PDF)</p>
                    <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-[11px] leading-relaxed text-[var(--feg-ink)] shadow-[0_14px_40px_rgba(0,36,3,0.06)]">
TOP 50 TOP 35 \tTOP 25 TOP 15 \tTOP 60 TOP 8 \tTOP 25 Top 6
FEDERACION o AREA METROPOLITANA
SUR \t1 \t1 \t1 \t3 \t0 \t0 \t1 \t1 \t1 \t2 \t3 \t1 \t1
MAR Y SIERRAS \t2 \t1 \t2 \t5 \t0 \t0 \t1 \t1 \t2 \t1 \t3 \t2 \t1 \t3
FENOBA \t4 \t1 \t3 \t8 \t1 \t0 \t1 \t3 \t2 \t5 \t0 \t1 \t1
NOROESTE \t0 \t0 \t1 \t1 \t0 \t0 \t1 \t1 \t0 \t1 \t1 \t0 \t1 \t1
NORDESTE \t0 \t0 \t1 \t1 \t0 \t0 \t1 \t1 \t2 \t2 \t0 \t1 \t1
CENTRO-CUYO \t1 \t0 \t1 \t0 \t0 \t1 \t1 \t2 \t1 \t3 \t0 \t1 \t1
CORDOBA \t5 \t5 \t1 \t11 \t2 \t2 \t1 \t5 \t2 \t1 \t1 \t4 \t2 \t1 \t1 \t4
METROPOLITANA \t4 \t3 \t2 \t9 \t4 \t2 \t1 \t7 \t3 \t1 \t4 \t3 \t1 \t4
LITORAL \t0 \t0 \t1 \t1 \t0 \t0 \t1 \t1 \t0 \t1 \t1 \t0 \t1 \t1
SUR DEL LITORAL \t1 \t3 \t1 \t5 \t0 \t1 \t1 \t1 \t1 \t2 \t1 \t1 \t2
Adicional Fed/Club sede \t1 \t1 \t1 \t1
SUB TOTALES \t18 \t14 \t3 \t10 \t46 \t7 \t5 \t6 \t2 \t21 \t16 \t8 \t1 \t3 \t29 \t9 \t4 \t5 \t1 \t20
TOTAL \t116
Nota: Los cuatro restantes lugares, hasta completar los 120 del field, están reservados para jugadores/as extranjeros en la eventualidad de que participen.
                    </pre>
                    <p className="mt-3 text-xs text-[var(--feg-green)]">
                      Nota: el cuadro completo y el detalle de columnas se encuentra en el PDF descargable.
                    </p>
                  </div>

                  <p className="mt-4">
                    Finalizado el 2° torneo nacional, los cupos se recalcularán según participación y rendimiento. Una vez finalizados
                    los torneos nacionales, los varones en los primeros cinco puestos de su ranking y las mujeres en los dos primeros
                    (Juveniles y Prejuveniles) tienen asegurado el cupo para el torneo siguiente (no adicional).
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">Criterios de asignación y nominación</h3>
                  <p className="mt-2">
                    Las federaciones y el Área Metropolitana definen la metodología de clasificación para cada torneo nacional,
                    combinando criterios: resultados de torneos regionales/federativos (o selectivos), ranking federativo vigente y/o
                    mérito deportivo. Los cupos se nominan por federación y se informan a la Comisión de Campeonatos AAG.
                  </p>
                  <div className="mt-4 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                      Límites de hándicap índex (al momento de la inscripción)
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-5">
                      <li>
                        <span className="font-semibold text-[var(--feg-ink)]">Juveniles Mujeres</span>: hasta 8.0
                      </li>
                      <li>
                        <span className="font-semibold text-[var(--feg-ink)]">Juveniles Varones</span>: 2008 hasta 3.0; 2009 hasta
                        4.0; 2010 hasta 5.0
                      </li>
                      <li>
                        <span className="font-semibold text-[var(--feg-ink)]">Prejuveniles Mujeres</span>: hasta 15.0
                      </li>
                      <li>
                        <span className="font-semibold text-[var(--feg-ink)]">Prejuveniles Varones</span>: 2011 hasta 9.0; 2012 hasta
                        11.0; 2013 a 2016 hasta 14.0
                      </li>
                    </ul>
                    <p className="mt-3 text-sm text-[var(--feg-green)]">
                      Cada federación puede, a su criterio, intercambiar un cupo (varón y mujer) entre juveniles y prejuveniles,
                      formalizando el cambio por email a Campeonatos AAG.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">Torneos regionales e inscripciones</h3>
                  <p className="mt-2">
                    Los torneos regionales tendrán puntaje especial para cada ranking (escala a publicarse). Las inscripciones se
                    implementan a través de las federaciones mediante formulario online de asignación de cupos, y además cada jugador/a
                    debe completar un formulario de inscripción individual antes del cierre para quedar inscripto/a.
                  </p>
                  <p className="mt-3">
                    El monto de inscripción varía según alojamiento (ofrecido por federación/club anfitrión o no). El club o la
                    federación pueden solicitar pago anticipado con alojamiento, y las cancelaciones dentro de los 10 días previos al
                    inicio del torneo pueden estar sujetas al cobro del valor respectivo.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

