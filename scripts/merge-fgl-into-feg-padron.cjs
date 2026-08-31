/**
 * Unifica el padrón FGL (player_youth_*) en el padrón FEG (Player vigente).
 *
 * - Si la persona ya está en FEG: copia DNI/hash al registro FEG y elimina el duplicado FGL.
 *   No cambia club, categoría, handicap ni matrícula FEG (la web pública no se altera).
 * - Si no está en FEG: el jugador FGL ya vive en Player; se deja en su club actual
 *   para no inflar los planteles públicos de clubes oficiales.
 *
 * Uso:
 *   node scripts/merge-fgl-into-feg-padron.cjs          # dry-run
 *   node scripts/merge-fgl-into-feg-padron.cjs --apply
 *
 * Requiere: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PLAYER_DATA_ENCRYPTION_KEY
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

function usableBirthYear(value) {
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year) || year <= 1900 || year > new Date().getFullYear()) return null;
  return year;
}

function yearFromBirthDate(birthDate) {
  if (!birthDate) return null;
  if (typeof birthDate === "string" && birthDate.length >= 4) {
    return usableBirthYear(Number(birthDate.slice(0, 4)));
  }
  return null;
}

function personYear(row) {
  return usableBirthYear(row.birthYear) ?? yearFromBirthDate(row.birthDate);
}

async function fetchAll(applyFilter) {
  let query = supabase
    .from("Player")
    .select("id,firstName,lastName,matricula,dniEnc,dniHash,birthYear,birthDate,clubId,category");
  if (applyFilter) query = applyFilter(query);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

function buildFegLookups(fegPlayers) {
  const byDni = new Map();
  const byUniqueName = new Map();
  const byUniqueTokens = new Map();
  const nameCount = new Map();
  const tokenCount = new Map();

  for (const p of fegPlayers) {
    const dni = canonicalDniForLookup(decryptSensitive(p.dniEnc));
    if (dni) byDni.set(dni, p);
    const key = personNameKey(p.firstName, p.lastName);
    if (key.includes("|") && !key.startsWith("|") && !key.endsWith("|")) {
      nameCount.set(key, (nameCount.get(key) ?? 0) + 1);
      byUniqueName.set(key, p);
    }
    const tokens = nameTokensKey(p.firstName, p.lastName);
    if (tokens) {
      tokenCount.set(tokens, (tokenCount.get(tokens) ?? 0) + 1);
      byUniqueTokens.set(tokens, p);
    }
  }
  for (const [key, count] of nameCount) {
    if (count !== 1) byUniqueName.delete(key);
  }
  for (const [key, count] of tokenCount) {
    if (count !== 1) byUniqueTokens.delete(key);
  }
  return { byDni, byUniqueName, byUniqueTokens };
}

function matchFeg(youth, lookups, usedFegIds) {
  const dni = canonicalDniForLookup(decryptSensitive(youth.dniEnc));
  if (dni) {
    const hit = lookups.byDni.get(dni);
    if (hit && !usedFegIds.has(hit.id)) return { hit, via: "dni" };
  }
  const nameKey = personNameKey(youth.firstName, youth.lastName);
  const named = lookups.byUniqueName.get(nameKey);
  if (named && !usedFegIds.has(named.id)) {
    const youthYear = personYear(youth);
    const fegYear = personYear(named);
    if (youthYear == null || fegYear == null || youthYear === fegYear) {
      return { hit: named, via: "name" };
    }
  }
  const tokens = nameTokensKey(youth.firstName, youth.lastName);
  const tok = tokens ? lookups.byUniqueTokens.get(tokens) : null;
  if (tok && !usedFegIds.has(tok.id)) return { hit: tok, via: "tokens" };
  return null;
}

async function clubPlayerCounts() {
  const { data, error } = await supabase.from("Player").select("clubId");
  if (error) throw new Error(error.message);
  const counts = {};
  for (const p of data ?? []) {
    counts[p.clubId] = (counts[p.clubId] ?? 0) + 1;
  }
  return counts;
}

async function main() {
  console.log(APPLY ? "Modo: APPLY" : "Modo: dry-run (no escribe)");

  const beforeCounts = await clubPlayerCounts();
  const fegPlayers = await fetchAll((q) => q.not("id", "like", "player_youth_%"));
  const youthPlayers = await fetchAll((q) => q.like("id", "player_youth_%"));
  const lookups = buildFegLookups(fegPlayers);
  const usedFegIds = new Set();

  const merges = [];
  let keepAsFeg = 0;

  for (const youth of youthPlayers) {
    const matched = matchFeg(youth, lookups, usedFegIds);
    if (!matched) {
      keepAsFeg += 1;
      continue;
    }
    usedFegIds.add(matched.hit.id);
    merges.push({ youth, feg: matched.hit, via: matched.via });
  }

  if (APPLY) {
    const now = new Date().toISOString();
    for (const { youth, feg } of merges) {
      const patch = {
        dniHash: feg.dniHash || youth.dniHash,
        dniEnc: feg.dniEnc || youth.dniEnc,
        updatedAt: now,
      };
      if ((!feg.birthDate || personYear(feg) == null) && youth.birthDate) {
        patch.birthDate = youth.birthDate;
        const y = personYear(youth);
        if (y) patch.birthYear = y;
      }
      const { error: updErr } = await supabase.from("Player").update(patch).eq("id", feg.id);
      if (updErr) throw new Error(`Update ${feg.id}: ${updErr.message}`);
      const { error: delErr } = await supabase.from("Player").delete().eq("id", youth.id);
      if (delErr) throw new Error(`Delete ${youth.id}: ${delErr.message}`);
    }
  }

  const afterCounts = APPLY ? await clubPlayerCounts() : beforeCounts;
  const officialIds = Object.keys(beforeCounts).filter((id) => !id.startsWith("club_youth_"));
  const countDrift = officialIds.filter((id) => (beforeCounts[id] ?? 0) !== (afterCounts[id] ?? 0));

  console.log(`FGL (player_youth_*): ${youthPlayers.length}`);
  console.log(`Fusionados en FEG existente: ${merges.length} (dni ${merges.filter((m) => m.via === "dni").length}, nombre ${merges.filter((m) => m.via === "name").length})`);
  console.log(`Ya en Player FEG (sin duplicado federado): ${keepAsFeg}`);
  console.log(`Planteles de clubes oficiales: ${countDrift.length === 0 ? "sin cambios" : `DERIVA ${countDrift.join(",")}`}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
