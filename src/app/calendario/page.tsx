import { getLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { parseAudienceSegment } from "@/lib/content-audience";
import { createCalendarLabels, getCalendarTableForAudience } from "@/lib/calendario-feg";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  searchParams: Promise<{ audiencia?: string | string[] }>;
};

export default async function CalendarioPage({ searchParams }: Props) {
  const sp = await searchParams;
  const segment = parseAudienceSegment(sp.audiencia) ?? "mayores";
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("calendar");
  const labels = createCalendarLabels((key) => t(key));
  const rows = getCalendarTableForAudience(segment, locale, labels);
  const tAudience = await getTranslations("audience");
  const segmentLabel = tAudience(segment);

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-10">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            {t("seasonBadge", { audience: segmentLabel, year: 2026 })}
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            {t("title", { audience: segmentLabel })}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--feg-green)]">
            {segment === "menores" ? t("subtitleMinors", { year: 2026 }) : t("subtitleMayores")}
          </p>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--feg-green-soft)] text-white">
              <tr>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  {t("colNum")}
                </th>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  {t("colDate")}
                </th>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  {t("colVenue")}
                </th>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  {t("colModality")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isSpecial = row.num === "—";
                return (
                  <tr
                    key={`${row.num}-${row.fecha}-${row.sede}-${i}`}
                    className={`border-t border-[var(--feg-green)]/10 transition hover:bg-[var(--feg-bg)]/80 ${
                      isSpecial ? "bg-[var(--feg-yellow)]/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-heading font-semibold text-[var(--feg-green-2)]">
                      {row.num}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--feg-ink)]">
                      {row.fecha}
                    </td>
                    <td className="px-4 py-3 text-[var(--feg-ink)]">{row.sede}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          isSpecial
                            ? "bg-[var(--feg-yellow)] text-[var(--feg-ink)]"
                            : "bg-[var(--feg-green-2)]/10 text-[var(--feg-green-2)]"
                        }`}
                      >
                        {row.modalidad}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
