export type ReglamentoSlug = "pre-juveniles" | "junior" | "mayores";

export type ReglamentoDefinition = {
  slug: ReglamentoSlug;
  title: string;
  description: string;
  pdfPath: string;
  downloadFileName: string;
  /** Etiqueta para menús desplegables (sin siglas). */
  navLabel: string;
  menores: boolean;
  mayores: boolean;
};

export const REGLAMENTOS: ReglamentoDefinition[] = [
  {
    slug: "pre-juveniles",
    title: "Reglamento Pre y Juveniles 2026",
    description:
      "Normativa de la Federación Entrerriana de Golf para competencias de Prejuveniles y Juveniles en la temporada 2026.",
    pdfPath: "/reglamentos/pre-juveniles-2026.pdf",
    downloadFileName: "Reglamento-Pre-Juveniles-FEG-2026.pdf",
    navLabel: "Reglamento Pre y Juveniles",
    menores: true,
    mayores: false,
  },
  {
    slug: "junior",
    title: "Reglamento Junior 2026",
    description:
      "Reglamento de la Federación Entrerriana de Golf para la categoría Junior en la temporada 2026.",
    pdfPath: "/reglamentos/junior-2026.pdf",
    downloadFileName: "Reglamento-Junior-FEG-2026.pdf",
    navLabel: "Reglamento Junior",
    menores: true,
    mayores: false,
  },
  {
    slug: "mayores",
    title: "Reglamento Mayores 2026",
    description:
      "Normativa de la Federación Entrerriana de Golf para competencias de Mayores en la temporada 2026.",
    pdfPath: "/reglamentos/mayores-2026.pdf",
    downloadFileName: "Reglamento-Mayores-FEG-2026.pdf",
    navLabel: "Reglamento Mayores",
    menores: false,
    mayores: true,
  },
];

export function getReglamentoBySlug(slug: string): ReglamentoDefinition | undefined {
  return REGLAMENTOS.find((r) => r.slug === slug);
}

export function getReglamentosMenores(): ReglamentoDefinition[] {
  return REGLAMENTOS.filter((r) => r.menores);
}

export function getReglamentoMayores(): ReglamentoDefinition {
  return REGLAMENTOS.find((r) => r.mayores)!;
}
