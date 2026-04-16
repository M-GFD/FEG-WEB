import sanitizeHtml from "sanitize-html";

/**
 * Sanitizado HTML en Node (Vercel) sin JSDOM/DOMPurify: evita el error
 * ESM `encoding-lite.js` que arrastra `html-encoding-sniffer` → `jsdom`.
 */
const ALLOWED_TAGS = [
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
];

export function sanitizeNewsContent(html: string): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      "*": ["class", "title"],
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
      a: ["http", "https", "mailto"],
    },
    allowProtocolRelative: false,
  });
}
