"use client";

type Props = {
  src: string;
  title: string;
};

/**
 * Visor embebido de PDF en la página de reglamento (mismo origen).
 * Usa object con fallback a iframe para compatibilidad entre navegadores.
 */
export function ReglamentoPdfEmbed({ src, title }: Props) {
  const viewSrc = `${src}#view=FitH&toolbar=1&navpanes=0`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
      <object
        data={viewSrc}
        type="application/pdf"
        title={title}
        className="block h-[min(80vh,900px)] w-full bg-[var(--feg-bg)]"
        aria-label={title}
      >
        <iframe
          src={viewSrc}
          title={title}
          className="h-[min(80vh,900px)] w-full border-0 bg-[var(--feg-bg)]"
        />
      </object>
    </div>
  );
}
