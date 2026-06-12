import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CUPOS_ROWS } from "@/components/institucional/reglamento-cupos";

const CUPOS_GROUP_DEFS = [
  { titleKey: "m18Men", aKey: "aLabel2008", bKey: "bLabel2010" },
  { titleKey: "m18Women", aKey: "aLabel2008", bKey: "bLabel2010" },
  { titleKey: "m15Men", aKey: "aLabel2011", bKey: "bLabelTNJ" },
  { titleKey: "m15Women", aKey: "aLabel2011", bKey: "bLabelTNJ" },
] as const;

export async function ReglamentoSection() {
  const t = await getTranslations("rankingRules");
  const tCommon = await getTranslations("common");

  return (
    <section className="grid gap-6 md:grid-cols-[200px_1fr] md:gap-10">
      <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55">
        {t("sectionLabel")}
      </div>
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
              {t("heading")}
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--feg-green)]">
              {t("intro")}
            </p>
          </div>
          <Link
            href="/reglamento-ranking-juveniles-prejuveniles-2026.pdf"
            download
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
          >
            {t("downloadPdf")}
          </Link>
        </div>

        <div className="mt-6 space-y-8 text-[15px] leading-relaxed text-[var(--feg-green)]">
          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">
              {t("computableTitle")}
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold text-[var(--feg-ink)]">{t("nationalTournaments")}</span>:{" "}
                {t("nationalTournamentsDesc")}
              </li>
              <li>
                <span className="font-semibold text-[var(--feg-ink)]">{t("generalCategory")}</span>:{" "}
                {t("generalCategoryDesc")}
              </li>
              <li>
                <span className="font-semibold text-[var(--feg-ink)]">{t("juvenilesCategory")}</span>:{" "}
                {t("juvenilesCategoryDesc")}
              </li>
              <li>
                <span className="font-semibold text-[var(--feg-ink)]">{t("prejuvenilesCategory")}</span>:{" "}
                {t("prejuvenilesCategoryDesc")}
              </li>
            </ul>

            <div className="mt-4 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                {t("datesVenuesTitle")}
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">{t("date1")}</span> — {t("venue1")}
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">{t("date2")}</span> — {t("venue2")}
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">{t("date3")}</span> — {t("venue3")}
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">{t("date4")}</span> — {t("venue4")}
                </li>
              </ul>
            </div>

            <p className="mt-4">
              <span className="font-semibold text-[var(--feg-ink)]">{t("championshipTitle")}</span>:{" "}
              {t("championshipDesc")}
            </p>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">{t("fieldTitle")}</h3>
            <p className="mt-2">{t("fieldBody")}</p>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">{t("quotasTitle")}</h3>
            <p className="mt-2">{t("quotasBody")}</p>

            <div className="mt-4 rounded-2xl border border-[var(--feg-green)]/12 bg-[var(--feg-bg)] p-4">
              <p className="text-sm font-semibold text-[var(--feg-ink)]">{t("quotasTableTitle")}</p>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {CUPOS_GROUP_DEFS.map((g, groupIndex) => (
                  <div
                    key={g.titleKey}
                    className="overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.06)]"
                  >
                    <div className="border-b border-[var(--feg-green)]/10 bg-[var(--feg-green-soft)] px-4 py-3 text-white">
                      <p className="font-heading text-xs font-semibold uppercase tracking-wider">
                        {t(`cuposGroups.${g.titleKey}`)}
                      </p>
                      <p className="mt-1 text-[11px] text-white/85">{t("quotasRankingLabel")}</p>
                    </div>

                    <div className="w-full">
                      <table className="w-full table-fixed text-left text-xs">
                        <thead className="bg-[var(--feg-bg)]">
                          <tr className="text-[10px] font-semibold uppercase tracking-wider text-[var(--feg-green-2)]">
                            <th className="w-[42%] px-3 py-2 font-heading text-[10px]">
                              {t("quotasColFed")}
                            </th>
                            <th className="w-[10%] px-2 py-2 text-center font-heading">
                              {t(`cuposGroups.${g.aKey}`)}
                            </th>
                            <th className="w-[10%] px-2 py-2 text-center font-heading">
                              {t(`cuposGroups.${g.bKey}`)}
                            </th>
                            <th className="w-[12%] px-2 py-2 text-center font-heading">{t("quotasColMin")}</th>
                            <th className="w-[12%] px-2 py-2 text-center font-heading">{t("quotasColAdd")}</th>
                            <th className="w-[14%] px-2 py-2 text-center font-heading">{t("quotasColTotal")}</th>
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
                                key={`${g.titleKey}-${row.fed}`}
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
                                  {v0 || tCommon("dash")}
                                </td>
                                <td
                                  className={
                                    "px-2 py-2 text-center font-medium " +
                                    (v1 ? "text-[var(--feg-green)]" : "text-[var(--feg-green)]/40")
                                  }
                                >
                                  {v1 || tCommon("dash")}
                                </td>
                                <td
                                  className={
                                    "px-2 py-2 text-center font-medium " +
                                    (vMin ? "text-[var(--feg-green)]" : "text-[var(--feg-green)]/40")
                                  }
                                >
                                  {vMin || tCommon("dash")}
                                </td>
                                <td
                                  className={
                                    "px-2 py-2 text-center font-medium " +
                                    (vAdd ? "text-[var(--feg-green)]" : "text-[var(--feg-green)]/40")
                                  }
                                >
                                  {vAdd || tCommon("dash")}
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
              <p className="mt-3 text-xs text-[var(--feg-green)]">{t("quotasNote")}</p>
            </div>

            <p className="mt-4">{t("quotasRecalc")}</p>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">{t("assignmentTitle")}</h3>
            <p className="mt-2">{t("assignmentBody")}</p>
            <div className="mt-4 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                {t("handicapLimitsTitle")}
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">{t("handicapJuvenilesWomen")}</span>:{" "}
                  {t("handicapJuvenilesWomenLimit")}
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">{t("handicapJuvenilesMen")}</span>:{" "}
                  {t("handicapJuvenilesMenLimit")}
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">{t("handicapPrejuvenilesWomen")}</span>:{" "}
                  {t("handicapPrejuvenilesWomenLimit")}
                </li>
                <li>
                  <span className="font-semibold text-[var(--feg-ink)]">{t("handicapPrejuvenilesMen")}</span>:{" "}
                  {t("handicapPrejuvenilesMenLimit")}
                </li>
              </ul>
              <p className="mt-3 text-sm text-[var(--feg-green)]">{t("handicapSwapNote")}</p>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--feg-ink)]">{t("regionalTitle")}</h3>
            <p className="mt-2">{t("regionalP1")}</p>
            <p className="mt-3">{t("regionalP2")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
