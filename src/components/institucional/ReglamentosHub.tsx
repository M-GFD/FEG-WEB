import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getReglamentoLabels, type ReglamentoDefinition } from "@/lib/reglamentos";

type Props = {
  reglamentos: ReglamentoDefinition[];
  detailBasePath: string;
};

export async function ReglamentosHub({ reglamentos, detailBasePath }: Props) {
  const tReg = await getTranslations("regulations");
  const tHub = await getTranslations("regulationsHub");

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {reglamentos.map((reglamento) => {
        const labels = getReglamentoLabels(reglamento, tReg);
        return (
          <article
            key={reglamento.slug}
            className="flex flex-col rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.08)]"
          >
            <h2 className="font-heading text-xl font-semibold tracking-tight text-[var(--feg-ink)]">
              {labels.title}
            </h2>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[var(--feg-green)]">
              {labels.description}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={`${detailBasePath}/${reglamento.slug}`}
                className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
              >
                {tHub("viewRegulation")}
              </Link>
              <a
                href={reglamento.pdfPath}
                download={reglamento.downloadFileName}
                className="inline-flex items-center justify-center rounded-full border border-[var(--feg-green)]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--feg-ink)] transition hover:bg-[var(--feg-bg)]"
              >
                {tHub("downloadPdf")}
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
