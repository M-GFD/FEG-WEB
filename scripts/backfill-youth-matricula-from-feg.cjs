/**
 * Copia matrícula AAG/FEG a jugadores juveniles (Player player_youth_*)
 * y a YouthEnrollment cuando el padrón FGL no la traía.
 *
 * Match primario: DNI descifrado (canónico).
 * Match secundario: nombre único en el padrón FEG + mismo año de nacimiento.
 *
 * Uso:
 *   node scripts/backfill-youth-matricula-from-feg.cjs          # dry-run
 *   node scripts/backfill-youth-matricula-from-feg.cjs --apply  # escribe en DB
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
const SEASON_YEAR = Number(process.env.FEG_EMPADRONAMIENTO_SEASON_YEAR || 2026);

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

function trimMat(value) {
  return typeof value === "string" ? value.trim() : "";
}

function clubMatKey(clubId, matricula) {
  return `${clubId}::${matricula}`;
}

async function fetchAll(table, columns, applyFilter) {
  let query = supabase.from(table).select(columns);
  if (applyFilter) query = applyFilter(query);
  const { data, error } = await query;
  if (error) throw new Error(`${table}: ${error.message}`);
  return data ?? [];
}

function buildFegLookups(fegPlayers) {
  const byDni = new Map();
  const byUniqueName = new Map();
  const nameCount = new Map();

  for (const p of fegPlayers) {
    const mat = trimMat(p.matricula);
    if (!mat) continue;
    const dni = canonicalDniForLookup(decryptSensitive(p.dniEnc));
    if (dni) byDni.set(dni, p);
    const key = personNameKey(p.firstName, p.lastName);
    if (key.includes("|") && !key.startsWith("|") && !key.endsWith("|")) {
      nameCount.set(key, (nameCount.get(key) ?? 0) + 1);
      byUniqueName.set(key, p);
    }
  }
  for (const [key, count] of nameCount) {
    if (count !== 1) byUniqueName.delete(key);
  }
  return { byDni, byUniqueName };
}

function matchFeg(row, lookups, usedFegIds) {
  const dni = canonicalDniForLookup(decryptSensitive(row.dniEnc));
  if (dni) {
    const hit = lookups.byDni.get(dni);
    if (hit && !usedFegIds.has(hit.id)) {
      return { hit, via: "dni" };
    }
  }
  const key = personNameKey(row.firstName, row.lastName);
  const hit = lookups.byUniqueName.get(key);
  if (!hit || usedFegIds.has(hit.id)) return null;
  const youthYear = usableBirthYear(row.birthYear) ?? yearFromBirthDate(row.birthDate);
  const fegYear = usableBirthYear(hit.birthYear) ?? yearFromBirthDate(hit.birthDate);
  if (youthYear == null || fegYear == null || youthYear !== fegYear) return null;
  return { hit, via: "name" };
}

async function main() {
  console.log(APPLY ? "Modo: APPLY (escribe en DB)" : "Modo: dry-run (no escribe)");

  const fegPlayers = await fetchAll(
    "Player",
    "id,firstName,lastName,matricula,dniEnc,birthYear,birthDate,clubId",
    (q) => q.not("id", "like", "player_youth_%").not("matricula", "is", null)
  );
  const youthPlayers = await fetchAll(
    "Player",
    "id,firstName,lastName,matricula,dniEnc,dniHash,birthYear,birthDate,clubId",
    (q) => q.like("id", "player_youth_%")
  );
  const enrollments = await fetchAll(
    "YouthEnrollment",
    "id,firstName,lastName,matricula,dniEnc,dniHash,birthDate,clubId",
    (q) => q.eq("seasonYear", SEASON_YEAR)
  );

  const lookups = buildFegLookups(fegPlayers);
  const usedFegIds = new Set();
  const usedClubMat = new Set();
  for (const p of youthPlayers) {
    const mat = trimMat(p.matricula);
    if (mat) usedClubMat.add(clubMatKey(p.clubId, mat));
  }

  const stats = {
    youthTotal: youthPlayers.length,
    youthAlready: 0,
    youthByDni: 0,
    youthByName: 0,
    youthConflict: 0,
    youthUnmatched: 0,
    enrollAlready: 0,
    enrollUpdated: 0,
    enrollUnmatched: 0,
  };

  const youthUpdates = [];
  const matriculaByDniHash = new Map();

  for (const youth of youthPlayers) {
    const existing = trimMat(youth.matricula);
    if (existing) {
      stats.youthAlready += 1;
      if (youth.dniHash) matriculaByDniHash.set(youth.dniHash, existing);
      continue;
    }
    const matched = matchFeg(youth, lookups, usedFegIds);
    if (!matched) {
      stats.youthUnmatched += 1;
      continue;
    }
    const mat = trimMat(matched.hit.matricula);
    const key = clubMatKey(youth.clubId, mat);
    if (usedClubMat.has(key)) {
      stats.youthConflict += 1;
      continue;
    }
    usedFegIds.add(matched.hit.id);
    usedClubMat.add(key);
    if (matched.via === "dni") stats.youthByDni += 1;
    else stats.youthByName += 1;
    if (youth.dniHash) matriculaByDniHash.set(youth.dniHash, mat);
    youthUpdates.push({ id: youth.id, matricula: mat });
  }

  const enrollmentUpdates = [];
  for (const row of enrollments) {
    const existing = trimMat(row.matricula);
    if (existing) {
      stats.enrollAlready += 1;
      continue;
    }
    const fromPlayer = row.dniHash ? matriculaByDniHash.get(row.dniHash) : "";
    if (fromPlayer) {
      enrollmentUpdates.push({ id: row.id, matricula: fromPlayer });
      stats.enrollUpdated += 1;
      continue;
    }
    const matched = matchFeg(row, lookups, usedFegIds);
    if (!matched) {
      stats.enrollUnmatched += 1;
      continue;
    }
    enrollmentUpdates.push({ id: row.id, matricula: trimMat(matched.hit.matricula) });
    stats.enrollUpdated += 1;
  }

  if (APPLY) {
    const now = new Date().toISOString();
    for (const u of youthUpdates) {
      const { error } = await supabase
        .from("Player")
        .update({ matricula: u.matricula, updatedAt: now })
        .eq("id", u.id);
      if (error) throw new Error(`Player ${u.id}: ${error.message}`);
    }
    for (const u of enrollmentUpdates) {
      const { error } = await supabase
        .from("YouthEnrollment")
        .update({ matricula: u.matricula, updatedAt: now })
        .eq("id", u.id);
      if (error) throw new Error(`YouthEnrollment ${u.id}: ${error.message}`);
    }
  }

  console.log("Juveniles Player:");
  console.log(`  total=${stats.youthTotal} ya_tenian=${stats.youthAlready} dni=${stats.youthByDni} nombre=${stats.youthByName} conflicto=${stats.youthConflict} sin_match=${stats.youthUnmatched}`);
  console.log("YouthEnrollment:");
  console.log(`  ya_tenian=${stats.enrollAlready} actualizados=${stats.enrollUpdated} sin_match=${stats.enrollUnmatched}`);
  console.log(`  pendientes de escritura: Player ${youthUpdates.length}, Enrollment ${enrollmentUpdates.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
