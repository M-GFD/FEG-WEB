import Link from "next/link";
import type { ReglamentoDefinition } from "@/lib/reglamentos";

type Props = {
  reglamento: ReglamentoDefinition;
  badge: string;
  backHref: string;
  backLabel: string;
};

export function ReglamentoPdfViewer({ reglamento, badge, backHref, backLabel }: Props) {
  return (
    <>
      <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-[var(--feg-green)]/20 bg-white/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            {badge}
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-4xl">
            {reglamento.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[var(--feg-green)]">
            {reglamento.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
          >
            {backLabel}
          </Link>
          <a
            href={reglamento.pdfPath}
            download={reglamento.downloadFileName}
            className="inline-flex items-center justify-center rounded-full border border-[var(--feg-green)]/25 bg-white px-6 py-2.5 text-sm font-semibold text-[var(--feg-ink)] shadow-sm transition hover:bg-[var(--feg-bg)]"
          >
            Descargar PDF →
          </a>
        </div>
      </header>

      <hr className="my-10 border-[var(--feg-green)]/10" />

      <div className="overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
        <iframe
          src={`${reglamento.pdfPath}#view=FitH`}
          title={reglamento.title}
          className="h-[min(80vh,900px)] w-full"
        />
      </div>

      <p className="mt-4 text-sm text-[var(--feg-green)]/80">
        Si el visor no carga correctamente,{" "}
        <a
          href={reglamento.pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--feg-green-2)] underline-offset-2 hover:underline"
        >
          abrí el PDF en una pestaña nueva
        </a>
        .
      </p>
    </>
  );
}
