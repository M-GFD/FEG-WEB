/**
 * Validate pt.json structure and report untranslated (pt === en) leaf strings.
 * Run: node scripts/validate-pt-messages.cjs
 */
const fs = require("fs");
const path = require("path");

function leafPaths(obj, prefix = "") {
  const paths = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") paths.push({ path: p, value: v });
    else paths.push(...leafPaths(v, p));
  }
  return paths;
}

const en = JSON.parse(fs.readFileSync(path.join(__dirname, "../messages/en.json"), "utf8"));
const es = JSON.parse(fs.readFileSync(path.join(__dirname, "../messages/es.json"), "utf8"));
const pt = JSON.parse(fs.readFileSync(path.join(__dirname, "../messages/pt.json"), "utf8"));

const enLeaves = leafPaths(en);
const esLeaves = leafPaths(es);
const ptLeaves = leafPaths(pt);

const enPaths = new Set(enLeaves.map((x) => x.path));
const esPaths = new Set(esLeaves.map((x) => x.path));
const ptPaths = new Set(ptLeaves.map((x) => x.path));

function diff(a, b) {
  return [...a].filter((p) => !b.has(p));
}

const missingInPt = diff(enPaths, ptPaths);
const extraInPt = diff(ptPaths, enPaths);
const missingInEs = diff(enPaths, esPaths);

const sameAsEn = ptLeaves.filter(({ path: p, value }) => {
  const enVal = enLeaves.find((x) => x.path === p)?.value;
  return enVal === value;
});

console.log("Leaf path counts: en", enLeaves.length, "es", esLeaves.length, "pt", ptLeaves.length);
console.log("Missing in pt (vs en):", missingInPt.length);
if (missingInPt.length) missingInPt.slice(0, 20).forEach((p) => console.log("  ", p));
console.log("Extra in pt (vs en):", extraInPt.length);
console.log("Missing in es (vs en):", missingInEs.length);
console.log("Same-as-EN pt values:", sameAsEn.length);
sameAsEn.forEach(({ path: p, value }) => console.log("  ", p, "=>", JSON.stringify(value)));

const ok =
  missingInPt.length === 0 &&
  extraInPt.length === 0 &&
  enLeaves.length === ptLeaves.length &&
  esLeaves.length === ptLeaves.length;

console.log("Validation:", ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
