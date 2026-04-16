/** Opciones compartidas; DOMPurify se importa solo al sanitizar (evita cargar JSDOM al boot en Vercel). */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "s",
    "strike",
    "h1",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "blockquote",
    "code",
    "pre",
    "hr",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
};

export async function sanitizeNewsContent(html: string): Promise<string> {
  const { default: DOMPurify } = await import("isomorphic-dompurify");
  return DOMPurify.sanitize(html ?? "", PURIFY_CONFIG);
}
