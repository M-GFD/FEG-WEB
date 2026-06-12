/**
 * Genera JSON de secciones desde texto extraído de PDF (UTF-8).
 */
const fs = require("fs");

const [, , slug, input, output] = process.argv;
if (!slug || !input || !output) {
  console.error("Uso: node build-reglamento-content.cjs <slug> <input.txt> <output.json>");
  process.exit(1);
}

let text = fs.readFileSync(input, "utf8");

text = text
  .replace(/^Reglamento[^\n]*\n/gm, "")
  .replace(/^REGLAMENTO[^\n]*\n/gm, "")
  .replace(/Página \d+ de \d+/g, "")
  .replace(/Pagina \d+ de \d+/gi, "")
  .replace(/-- \d+ of \d+ --/g, "")
  .trim();

const lines = text.split("\n");
const sections = [];
let current = null;

function isHeader(line) {
  if (/^Anexo I\)/i.test(line)) return false;

  if (slug === "pre-juveniles") {
    if (/^ANEXO\s+[IVX\d]+\s*$/i.test(line)) return true;
    if (/^(I{1,3}|IV|V|VI{0,3}|IX|X|XI{0,2}|XII)\.\s+/.test(line)) return true;
    return false;
  }

  const m = line.match(/^(\d{1,2})\.\s+(.+)/);
  if (!m) return false;
  const num = parseInt(m[1], 10);
  const max = slug === "junior" ? 18 : slug === "mayores" ? 22 : 0;
  if (!max || num < 1 || num > max) return false;
  const beforeParen = m[2].split("(")[0];
  return !/[a-záéíóúñ]/.test(beforeParen);
}

function pushLine(line) {
  if (!current) return;
  current.lines.push(line);
}

for (const raw of lines) {
  const line = raw.trim();
  if (!line) continue;

  if (isHeader(line)) {
    if (current) sections.push(current);
    current = { title: line, lines: [] };
    continue;
  }

  if (!current) continue;
  pushLine(line);
}
if (current) sections.push(current);

function parseBody(bodyLines) {
  const blocks = [];
  let buf = [];
  let bulletBuf = [];

  const flushPara = () => {
    if (buf.length) {
      blocks.push({ type: "paragraph", text: buf.join(" ") });
      buf = [];
    }
  };
  const flushBullets = () => {
    if (bulletBuf.length) {
      blocks.push({ type: "bullets", items: [...bulletBuf] });
      bulletBuf = [];
    }
  };

  for (const line of bodyLines) {
    const isBullet = /^[●•○]\s/.test(line) || /^-\s/.test(line);
    const isLetterItem = /^[A-Z]\.\s/.test(line);
    const isNumbered = /^\d+[\.)]\s/.test(line);

    if (isBullet) {
      flushPara();
      bulletBuf.push(line.replace(/^[●•○]\s*/, "").replace(/^-\s*/, ""));
      continue;
    }

    if (isLetterItem || isNumbered) {
      flushPara();
      flushBullets();
      blocks.push({ type: "paragraph", text: line });
      continue;
    }

    if (bulletBuf.length) {
      const last = bulletBuf[bulletBuf.length - 1];
      if (!/[:;]$/.test(last) && line[0] === line[0].toLowerCase()) {
        bulletBuf[bulletBuf.length - 1] = `${last} ${line}`;
        continue;
      }
      flushBullets();
    }

    if (buf.length && !/[.!?;:]$/.test(buf[buf.length - 1])) {
      buf[buf.length - 1] = `${buf[buf.length - 1]} ${line}`;
    } else {
      buf.push(line);
    }
  }

  flushBullets();
  flushPara();
  return blocks;
}

let result = sections.map((s, i) => ({
  id: `${slug}-s${i + 1}`,
  title: s.title,
  blocks: parseBody(s.lines),
}));

// Fusionar secciones erróneas de una sola línea de referencia.
result = result.reduce((acc, section) => {
  const prev = acc[acc.length - 1];
  if (prev && /^Anexo I\)/i.test(section.title)) {
    prev.blocks.push({ type: "paragraph", text: section.title });
    prev.blocks.push(...section.blocks);
    return acc;
  }
  acc.push(section);
  return acc;
}, []);

result = result.map((s, i) => ({ ...s, id: `${slug}-s${i + 1}` }));

fs.mkdirSync(require("path").dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(result, null, 2), "utf8");
console.log("Wrote", output, "sections:", result.length);
