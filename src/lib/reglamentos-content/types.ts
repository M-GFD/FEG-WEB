export type ReglamentoBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] };

export type ReglamentoContentSection = {
  id: string;
  title: string;
  blocks: ReglamentoBlock[];
};

export type ReglamentoSlug = "pre-juveniles" | "junior" | "mayores";
