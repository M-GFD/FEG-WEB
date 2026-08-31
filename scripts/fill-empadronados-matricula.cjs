/**
 * Completa Player.matricula de empadronados desde el padrón FEG vigente:
 * 1) id player_<nro> con matrícula vacía (el import FGL la había borrado)
 * 2) cruce por DNI / nombre único / tokens de nombre (sin exigir año: FEG La Paz usa 1900)
 *
 * Si el mismo club ya tiene esa matrícula, no se duplica (unique clubId+matricula);
 * el listado admin igual la muestra por overlay.
 *
 * Uso:
 *   node scripts/fill-empadronados-matricula.cjs
 *   node scripts/fill-empadronados-matricula.cjs --apply
 */

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const APPLY = process.argv.includes("--apply");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KEY_RAW = (process.env.PLAYER_DATA_ENCRYPTION_KEY ?? "").trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[!] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!KEY_RAW || KEY_RAW.length !== 64) {
  console.error("[!] PLAYER_DATA_ENCRYPTION_KEY inválida o ausente.");
  process.exit(1);
}

const KEY = Buffer.from(KEY_RAW, "hex");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

function decryptSensitive(payload) {
  if (!payload || typeof payload !== "string") return "";
  if (!payload.startsWith("gcm:v1:")) return "";
  const [ivB64, tagB64, ctB64] = payload.slice("gcm:v1:".length).split(":");
  if (!ivB64 || !tagB64 || !ctB64) return "";
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      KEY,
      Buffer.from(ivB64, "base64")
    );
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(ctB64, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
}

function canonicalDniForLookup(dni) {
  const digits = String(dni || "").replace(/\D/g, "").trim();
  if (!digits) return "";
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || n < 1000) return digits;
  return String(n);
}

function normalizePersonName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function personNameKey(firstName, lastName) {
  return `${normalizePersonName(lastName)}|${normalizePersonName(firstName)}`;
}

function nameTokensKey(firstName, lastName) {
  const tokens = `${normalizePersonName(firstName)} ${normalizePersonName(lastName)}`
    .split(/[\s\-']+/)
    .filter((t) => t.length >= 2)
    .sort();
  return tokens.length >= 2 ? tokens.join("|") : "";
}

function matriculaFromPlayerId(id) {
  const m = /^player_(\d+)$/.exec(String(id ?? ""));
  return m ? m[1] : "";
}

function trimMat(value) {
  return typeof value === "string" ? value.trim() : "";
}

function usableBirthYear(value) {
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year) || year <= 1900 || year > new Date().getFullYear()) return null;
  return year;
}

async function fetchPlayers() {
  const { data, error } = await supabase
    .from("Player")
    .select("id,firstName,lastName,matricula,dniEnc,dniHash,birthYear,clubId");
  if (error) throw new Error(error.message);
  return data ?? [];
}

function isEmpadronado(p) {
  return Boolean(p.dniHash) || String(p.id).startsWith("player_youth_");
}

function buildLookups(fegPlayers) {
  const byDni = new Map();
  const byName = new Map();
  const byTokens = new Map();
  const nameCount = new Map();
  const tokenCount = new Map();
  const clubMat = new Set();

  for (const p of fegPlayers) {
    const mat = trimMat(p.matricula) || matriculaFromPlayerId(p.id);
    if (mat) clubMat.add(`${p.clubId}::${mat}`);
    if (!mat) continue;
    const dni = canonicalDniForLookup(decryptSensitive(p.dniEnc));
    if (dni) byDni.set(dni, { mat, clubId: p.clubId, id: p.id });
    const nk = personNameKey(p.firstName, p.lastName);
    if (nk.includes("|") && !nk.startsWith("|") && !nk.endsWith("|")) {
      nameCount.set(nk, (nameCount.get(nk) ?? 0) + 1);
      byName.set(nk, { mat, clubId: p.clubId, id: p.id, year: usableBirthYear(p.birthYear) });
    }
    const tk = nameTokensKey(p.firstName, p.lastName);
    if (tk) {
      tokenCount.set(tk, (tokenCount.get(tk) ?? 0) + 1);
      byTokens.set(tk, { mat, clubId: p.clubId, id: p.id });
    }
  }
  for (const [k, c] of nameCount) if (c !== 1) byName.delete(k);
  for (const [k, c] of tokenCount) if (c !== 1) byTokens.delete(k);
  return { byDni, byName, byTokens, clubMat };
}

function matchMat(p, lookups) {
  const dni = canonicalDniForLookup(decryptSensitive(p.dniEnc));
  if (dni && lookups.byDni.has(dni)) return { ...lookups.byDni.get(dni), via: "dni" };
  const nk = personNameKey(p.firstName, p.lastName);
  const named = lookups.byName.get(nk);
  if (named) {
    const y = usableBirthYear(p.birthYear);
    if (y == null || named.year == null || y === named.year) {
      return { ...named, via: "name" };
    }
  }
  const tk = nameTokensKey(p.firstName, p.lastName);
  const tok = tk ? lookups.byTokens.get(tk) : null;
  if (tok) return { ...tok, via: "tokens" };
  return null;
}

async function main() {
  console.log(APPLY ? "Modo: APPLY" : "Modo: dry-run");
  const all = await fetchPlayers();
  const feg = all.filter((p) => !String(p.id).startsWith("player_youth_"));
  const targets = all.filter(isEmpadronado);
  const lookups = buildLookups(feg);

  const idRestores = [];
  for (const p of all) {
    const fromId = matriculaFromPlayerId(p.id);
    if (fromId && !trimMat(p.matricula)) idRestores.push({ id: p.id, matricula: fromId });
  }

  const copies = [];
  let overlayOnly = 0;
  let unmatched = 0;
  for (const p of targets) {
    if (trimMat(p.matricula) || matriculaFromPlayerId(p.id)) continue;
    const hit = matchMat(p, lookups);
    if (!hit) {
      unmatched += 1;
      continue;
    }
    const key = `${p.clubId}::${hit.mat}`;
    if (lookups.clubMat.has(key)) {
      overlayOnly += 1;
      continue;
    }
    copies.push({ id: p.id, matricula: hit.mat, via: hit.via });
    lookups.clubMat.add(key);
  }

  if (APPLY) {
    const now = new Date().toISOString();
    for (const u of [...idRestores, ...copies]) {
      const { error } = await supabase
        .from("Player")
        .update({ matricula: u.matricula, updatedAt: now })
        .eq("id", u.id);
      if (error) throw new Error(`${u.id}: ${error.message}`);
    }
  }

  const afterMat = APPLY
    ? (await fetchPlayers()).filter(isEmpadronado).filter((p) => trimMat(p.matricula) || matriculaFromPlayerId(p.id)).length
    : targets.filter((p) => trimMat(p.matricula) || matriculaFromPlayerId(p.id)).length + idRestores.length + copies.length;

  console.log(`Empadronados: ${targets.length}`);
  console.log(`Restaurar desde id player_<nro>: ${idRestores.length}`);
  console.log(`Copiar matrícula FEG al empadronado: ${copies.length}`);
  console.log(`Cruce FEG pero mismo club (se muestra en listado, no se duplica en DB): ${overlayOnly}`);
  console.log(`Sin matrícula AAG en padrón FEG: ${unmatched}`);
  console.log(`Con matrícula tras esta pasada (campo o id): ${afterMat}/${targets.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
