import Link from "next/link";
import { CUPOS_GROUPS, CUPOS_ROWS } from "@/components/institucional/reglamento-cupos";

export function ReglamentoSection() {
  return (
    <section className="grid gap-6 md:grid-cols-[200px_1fr] md:gap-10">
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
              Lineamientos y metodología de competencias computables, cupos, criterios de asignación e
              inscripciones.
            </p>
          </div>
          <Link
            href="/reglamento-ranking-juveniles-prejuveniles-2026.pdf"
            download
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
          >
            Descargar PDF →
          </Link>
        </div>

        <div className="mt-6 space-y-8 text-[15px] leading-relaxed text-[var(--feg-green)]">
          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">
              Competencias computables
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold text-[var(--feg-ink)]">Torneos Nacionales</span>: cuatro
                torneos a 54 hoyos con categorías en Mujeres y Varones.
              </li>
              <li>
                <span className="font-semibold text-[var(--feg-ink)]">General</span>: Juveniles (Menores)
                y Prejuveniles (M15) conjuntamente. Puntaje WAGR.
              </li>
              <li>
                <span className="font-semibold text-[var(--feg-ink)]">Juveniles</span>: clases 2008-2009-2010
                en 2026.
              </li>
              <li>
                <span className="font-semibold text-[var(--feg-ink)]">Prejuveniles</span>: clases 2011 a
                2016 en 2026.
              </li>
            </ul>

            <div className="mt-4 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                Fechas y sedes (Torneos Nacionales)
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">13 al 15 de marzo</span> — F.R.G.
                  Sur, Golf Club Sierra de la Ventana
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">15 al 17 de mayo</span> — F.R.G. Mar
                  y Sierras, Costa Esmeralda Golf &amp; Links
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">7 al 9 de agosto</span> — Federación
                  del Sur del Litoral, club sede a confirmar
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">11 al 13 de septiembre</span> —
                  federación y club sede a confirmar
                </li>
              </ul>
            </div>

            <p className="mt-4">
              <span className="font-semibold text-[var(--feg-ink)]">
                Campeonato Argentino de Juveniles y Prejuveniles
              </span>
              : 2 al 4 de octubre (Federación de Golf de Pcia. de Córdoba, club a designar), de acuerdo a
              reglamentación propia.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">Field y corte</h3>
            <p className="mt-2">
              Field máximo de <span className="font-semibold text-[var(--feg-ink)]">120 jugadores/as</span>{" "}
              en cada torneo nacional. En los torneos nacionales se implementará un corte clasificatorio por
              categoría tras 36 hoyos, para permitir un esquema de 13 salidas desde los hoyos 1 y 10 y
              facilitar el cierre temprano o la recuperación de hoyos pendientes.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">
              Cupos por federación
            </h3>
            <p className="mt-2">
              Los cupos se establecen según el ordenamiento final del Ranking Argentino 2025 por regiones,
              ponderando puntos obtenidos en torneos nacionales (no regionales), considerando a la clase 2010
              (pasa a Juveniles) y excluyendo clase 2007. Se otorga un cupo mínimo de 1 cuando no hubiera
              puntaje, y para Prejuveniles se calculan cupos adicionales por performances en el Torneo
              Nacional Junior 2025. Los cupos son{" "}
              <span className="font-semibold text-[var(--feg-ink)]">innominados</span>.
            </p>

            <div className="mt-4 rounded-2xl border border-[var(--feg-green)]/12 bg-[var(--feg-bg)] p-4">
              <p className="text-sm font-semibold text-[var(--feg-ink)]">Cuadro de cupos (según PDF)</p>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {CUPOS_GROUPS.map((g, groupIndex) => (
                  <div
                    key={g.title}
                    className="overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.06)]"
                  >
                    <div className="border-b border-[var(--feg-green)]/10 bg-[var(--feg-green-soft)] px-4 py-3 text-white">
                      <p className="font-heading text-xs font-semibold uppercase tracking-wider">
                        {g.title}
                      </p>
                      <p className="mt-1 text-[11px] text-white/85">Ranking 2025</p>
                    </div>

                    <div className="w-full">
                      <table className="w-full table-fixed text-left text-xs">
                        <thead className="bg-[var(--feg-bg)]">
                          <tr className="text-[10px] font-semibold uppercase tracking-wider text-[var(--feg-green-2)]">
                            <th className="w-[42%] px-3 py-2 font-heading text-[10px]">
                              Federación / Área
                            </th>
                            <th className="w-[10%] px-2 py-2 text-center font-heading">{g.aLabel}</th>
                            <th className="w-[10%] px-2 py-2 text-center font-heading">{g.bLabel}</th>
                            <th className="w-[12%] px-2 py-2 text-center font-heading">Mín.</th>
                            <th className="w-[12%] px-2 py-2 text-center font-heading">Adic.</th>
                            <th className="w-[14%] px-2 py-2 text-center font-heading">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CUPOS_ROWS.map((row) => {
                            const isSubtotal = row.fed.toUpperCase().includes("SUB TOTALES");
                            const isAdicional = row.fed.toUpperCase().includes("ADICIONAL");
                            const base = groupIndex * 5;
                            const v0 = row.values[base] ?? 0;
                            const v1 = row.values[base + 1] ?? 0;
                            const vMin = row.values[base + 2] ?? 0;
                            const vAdd = row.values[base + 3] ?? 0;
                            const vTot = row.values[base + 4] ?? 0;

                            return (
                              <tr
                                key={`${g.title}-${row.fed}`}
                                className={
                                  "border-t border-[var(--feg-green)]/10 " +
                                  (isSubtotal ? "bg-[var(--feg-bg)]" : "bg-white") +
                                  " hover:bg-[var(--feg-bg)]/70"
                                }
                              >
                                <td className="px-3 py-2 font-heading text-[11px] font-semibold uppercase tracking-wide text-[var(--feg-ink)]">
                                  <span className={isAdicional ? "italic" : ""}>{row.fed}</span>
                                </td>
                                <td
                                  className={
                                    "px-2 py-2 text-center font-medium " +
                                    (v0 ? "text-[var(--feg-green)]" : "text-[var(--feg-green)]/40")
                                  }
                                >
                                  {v0 || "—"}
                                </td>
                                <td
                                  className={
                                    "px-2 py-2 text-center font-medium " +
                                    (v1 ? "text-[var(--feg-green)]" : "text-[var(--feg-green)]/40")
                                  }
                                >
                                  {v1 || "—"}
                                </td>
                                <td
                                  className={
                                    "px-2 py-2 text-center font-medium " +
                                    (vMin ? "text-[var(--feg-green)]" : "text-[var(--feg-green)]/40")
                                  }
                                >
                                  {vMin || "—"}
                                </td>
                                <td
                                  className={
                                    "px-2 py-2 text-center font-medium " +
                                    (vAdd ? "text-[var(--feg-green)]" : "text-[var(--feg-green)]/40")
                                  }
                                >
                                  {vAdd || "—"}
                                </td>
                                <td className="px-2 py-2 text-center font-semibold text-[var(--feg-ink)]">
                                  {vTot}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--feg-green)]">
                Nota: el detalle y notas complementarias se encuentran en el PDF descargable.
              </p>
            </div>

            <p className="mt-4">
              Finalizado el 2° torneo nacional, los cupos se recalcularán según participación y rendimiento.
              Una vez finalizados los torneos nacionales, los varones en los primeros cinco puestos de su
              ranking y las mujeres en los dos primeros (Juveniles y Prejuveniles) tienen asegurado el cupo
              para el torneo siguiente (no adicional).
            </p>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">
              Criterios de asignación y nominación
            </h3>
            <p className="mt-2">
              Las federaciones y el Área Metropolitana definen la metodología de clasificación para cada
              torneo nacional, combinando criterios: resultados de torneos regionales/federativos (o
              selectivos), ranking federativo vigente y/o mérito deportivo. Los cupos se nominan por
              federación y se informan a la Comisión de Campeonatos AAG.
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
                  <span className="font-semibold text-[var(--feg-ink)]">Juveniles Varones</span>: 2008 hasta
                  3.0; 2009 hasta 4.0; 2010 hasta 5.0
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">Prejuveniles Mujeres</span>: hasta
                  15.0
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">Prejuveniles Varones</span>: 2011
                  hasta 9.0; 2012 hasta 11.0; 2013 a 2016 hasta 14.0
                </li>
              </ul>
              <p className="mt-3 text-sm text-[var(--feg-green)]">
                Cada federación puede, a su criterio, intercambiar un cupo (varón y mujer) entre juveniles y
                prejuveniles, formalizando el cambio por email a Campeonatos AAG.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">
              Torneos regionales e inscripciones
            </h3>
            <p className="mt-2">
              Los torneos regionales tendrán puntaje especial para cada ranking (escala a publicarse). Las
              inscripciones se implementan a través de las federaciones mediante formulario online de
              asignación de cupos, y además cada jugador/a debe completar un formulario de inscripción
              individual antes del cierre para quedar inscripto/a.
            </p>
            <p className="mt-3">
              El monto de inscripción varía según alojamiento (ofrecido por federación/club anfitrión o no).
              El club o la federación pueden solicitar pago anticipado con alojamiento, y las cancelaciones
              dentro de los 10 días previos al inicio del torneo pueden estar sujetas al cobro del valor
              respectivo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
