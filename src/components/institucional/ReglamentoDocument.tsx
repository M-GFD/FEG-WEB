import type { ReglamentoBlock, ReglamentoContentSection } from "@/lib/reglamentos-content";

function Block({ block }: { block: ReglamentoBlock }) {
  if (block.type === "bullets") {
    return (
      <ul className="mt-3 list-disc space-y-2 pl-5">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "numbered") {
    return (
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    );
  }

  return <p className="mt-3 first:mt-0">{block.text}</p>;
}

type Props = {
  sections: ReglamentoContentSection[];
};

/** Cuerpo del reglamento con el mismo estilo que /institucional/reglamento. */
export function ReglamentoDocument({ sections }: Props) {
  return (
    <section className="grid gap-10 md:grid-cols-[200px_1fr] md:gap-10">
      <div className="hidden text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55 md:block">
        Reglamento
      </div>
      <div className="space-y-10 text-[15px] leading-relaxed text-[var(--feg-green)]">
        {sections.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="scroll-mt-28 rounded-2xl border border-[var(--feg-green)]/10 bg-white/60 p-5 shadow-[0_14px_40px_rgba(0,36,3,0.06)] md:p-6"
          >
            <h2 className="font-heading text-xl font-semibold tracking-tight text-[var(--feg-ink)] md:text-2xl">
              {section.title}
            </h2>
            <div className="mt-2">
              {section.blocks.map((block, i) => (
                <Block key={`${section.id}-b${i}`} block={block} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
