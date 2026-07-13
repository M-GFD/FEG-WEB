/**
 * Convierte texto extraído de PDF a secciones JSON (borrador para curar en TS).
 * Uso: node scripts/parse-reglamento-txt.cjs docs/extracted-junior-2026.txt
 */
const fs = require("fs");

const input = process.argv[2];
if (!input) {
  console.error("Uso: node parse-reglamento-txt.cjs <archivo.txt>");
  process.exit(1);
}

let text = fs.readFileSync(input, "utf8");

text = text
  .replace(/Reglamento[^\n]*\n/g, "")
  .replace(/REGLAMENTO[^\n]*\n/g, "")
  .replace(/Página \d+ de \d+/g, "")
  .replace(/-- \d+ of \d+ --/g, "")
  .replace(/Pagina \d+ de \d+/gi, "")
  .trim();

const sectionRe = /(?:^|\n)((?:\d{1,2}\.|[IVXLC]+\.)\s+[^\n]+)/g;
const parts = [];
let lastIndex = 0;
let match;

while ((match = sectionRe.exec(text)) !== null) {
  if (parts.length) {
    parts[parts.length - 1].body = text.slice(lastIndex, match.index).trim();
  }
  parts.push({ title: match[1].trim(), body: "" });
  lastIndex = match.index + match[1].length;
}
if (parts.length) {
  parts[parts.length - 1].body = text.slice(lastIndex).trim();
}

function bodyToBlocks(body) {
  const lines = body.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  let bullets = [];

  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ type: "bullets", items: [...bullets] });
      bullets = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("●") || line.startsWith("•") || line.startsWith("- ")) {
      bullets.push(line.replace(/^[●•]\s*/, "").replace(/^-\s*/, ""));
      continue;
    }
    if (/^\d+[\.)]\s/.test(line)) {
      flushBullets();
      blocks.push({ type: "paragraph", text: line });
      continue;
    }
    flushBullets();
    blocks.push({ type: "paragraph", text: line });
  }
  flushBullets();
  return blocks;
}

const sections = parts.map((p, i) => ({
  id: `s${i + 1}`,
  title: p.title,
  blocks: bodyToBlocks(p.body),
}));

console.log(JSON.stringify(sections, null, 2));
