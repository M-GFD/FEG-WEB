/**
 * Build messages/pt.json from messages/en.json with Brazilian Portuguese translations.
 * Run: node scripts/build-pt-messages.cjs
 */
const fs = require("fs");
const path = require("path");

const en = JSON.parse(fs.readFileSync(path.join(__dirname, "../messages/en.json"), "utf8"));

/** @type {Record<string, string>} */
const T = JSON.parse(fs.readFileSync(path.join(__dirname, "en-pt-map.json"), "utf8"));

function translate(value) {
  if (value in T) return T[value];
  console.warn("Untranslated string:", JSON.stringify(value));
  return value;
}

function walk(obj) {
  if (typeof obj === "string") return translate(obj);
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[k] = walk(v);
  return out;
}

const pt = walk(en);
fs.writeFileSync(path.join(__dirname, "../messages/pt.json"), JSON.stringify(pt, null, 2) + "\n");
console.log("Wrote messages/pt.json with", Object.keys(T).length, "map entries");
