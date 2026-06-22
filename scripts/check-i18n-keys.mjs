import fs from "fs";
import path from "path";

const messages = JSON.parse(fs.readFileSync("messages/es.json", "utf8"));

function flatten(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) keys.push(...flatten(v, p));
    else keys.push(p);
  }
  return keys;
}
const allKeys = new Set(flatten(messages));

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!["node_modules", ".next"].includes(f)) walk(p, files);
    } else if (/\.(tsx|ts)$/.test(f)) files.push(p);
  }
  return files;
}

const issues = [];

for (const file of walk("src")) {
  const content = fs.readFileSync(file, "utf8");
  const varToNs = new Map();
  const nsRe =
    /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*["']([^"']+)["']\s*\)/g;
  for (const m of content.matchAll(nsRe)) {
    varToNs.set(m[1], m[2]);
  }
  if (varToNs.size === 0) continue;

  for (const [varName, ns] of varToNs) {
    const callRe = new RegExp(`\\b${varName}\\(\\s*["']([^"']+)["']`, "g");
    for (const m of content.matchAll(callRe)) {
      const key = m[1];
      if (key.includes("${")) continue;
      const full = `${ns}.${key}`;
      if (!allKeys.has(full)) {
        issues.push({ file, full, varName });
      }
    }
  }
}

const seen = new Set();
const unique = issues.filter((i) => {
  const k = `${i.full}|${i.file}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

unique.sort((a, b) => a.full.localeCompare(b.full));
console.log(`Missing keys: ${unique.length}`);
for (const i of unique) {
  console.log(`${i.full} via ${i.varName} (${i.file.replace(/\\/g, "/")})`);
}
