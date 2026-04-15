import DOMPurify from "isomorphic-dompurify";

export function sanitizeNewsContent(html: string): string {
  return DOMPurify.sanitize(html ?? "", {
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
  });
}
