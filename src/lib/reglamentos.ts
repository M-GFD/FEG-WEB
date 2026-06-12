export type ReglamentoSlug = "pre-juveniles" | "junior" | "mayores";

export type ReglamentoDefinition = {
  slug: ReglamentoSlug;
  titleKey: string;
  descriptionKey: string;
  pdfPath: string;
  downloadFileName: string;
  /** Etiqueta para menús desplegables (sin siglas). */
  navLabelKey: string;
  menores: boolean;
  mayores: boolean;
};

export const REGLAMENTOS: ReglamentoDefinition[] = [
  {
    slug: "pre-juveniles",
    titleKey: "preJuveniles.title",
    descriptionKey: "preJuveniles.description",
    pdfPath: "/reglamentos/pre-juveniles-2026.pdf",
    downloadFileName: "Reglamento-Pre-Juveniles-FEG-2026.pdf",
    navLabelKey: "preJuveniles.navLabel",
    menores: true,
    mayores: false,
  },
  {
    slug: "junior",
    titleKey: "junior.title",
    descriptionKey: "junior.description",
    pdfPath: "/reglamentos/junior-2026.pdf",
    downloadFileName: "Reglamento-Junior-FEG-2026.pdf",
    navLabelKey: "junior.navLabel",
    menores: true,
    mayores: false,
  },
  {
    slug: "mayores",
    titleKey: "mayores.title",
    descriptionKey: "mayores.description",
    pdfPath: "/reglamentos/mayores-2026.pdf",
    downloadFileName: "Reglamento-Mayores-FEG-2026.pdf",
    navLabelKey: "mayores.navLabel",
    menores: false,
    mayores: true,
  },
];

export type ReglamentoTranslator = (key: string) => string;

export function getReglamentoLabels(
  reglamento: ReglamentoDefinition,
  t: ReglamentoTranslator
) {
  return {
    title: t(reglamento.titleKey),
    description: t(reglamento.descriptionKey),
    navLabel: t(reglamento.navLabelKey),
  };
}

export function getReglamentoBySlug(slug: string): ReglamentoDefinition | undefined {
  return REGLAMENTOS.find((r) => r.slug === slug);
}

export function getReglamentosMenores(): ReglamentoDefinition[] {
  return REGLAMENTOS.filter((r) => r.menores);
}

export function getReglamentoMayores(): ReglamentoDefinition {
  return REGLAMENTOS.find((r) => r.mayores)!;
}
