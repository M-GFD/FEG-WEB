/**
 * Actualiza birthDate / birthYear de empadronados (Player + YouthEnrollment)
 * desde el padrón FGL de migración (fechas reales día/mes/año).
 *
 * Match por dniHash (misma fórmula que el empadronamiento web).
 *
 * Uso:
 *   node scripts/update-youth-birthdates-from-padron.cjs          # dry-run
 *   node scripts/update-youth-birthdates-from-padron.cjs --apply  # escribe en DB
 *
 * Requiere: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Opcional: FEG_YOUTH_PADRON_MD (default: docs/empadronamiento-fgl-2026-migracion.md)
 */

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const APPLY = process.argv.includes("--apply");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEASON_YEAR = Number(process.env.FEG_EMPADRONAMIENTO_SEASON_YEAR || 2026);
const PADRON_PATH =
  process.env.FEG_YOUTH_PADRON_MD ||
  path.join(__dirname, "..", "docs", "empadronamiento-fgl-2026-migracion.md");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[!] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!fs.existsSync(PADRON_PATH)) {
  console.error("[!] No existe:", PADRON_PATH);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

function hashDniForLookup(canonicalDni) {
  return crypto
    .createHash("sha256")
    .update(`feg-youth-enrollment:${canonicalDni}`)
    .digest("hex");
}

function cleanDni(raw) {
  if (!raw) return null;
  const t = String(raw).trim();
  if (!/^-?\d+$/.test(t)) return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 1000) return null;
  return String(n);
}

function rowToCells(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
  return trimmed.slice(1, -1).split("|").map((c) => c.trim());
}

function isSeparatorRow(cells) {
  return cells.every((c) => /^:?-+:?$/.test(c));
}

function readMdTable(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const start = text.indexOf("## Jugadores");
  const slice = start >= 0 ? text.slice(start) : text;
  const lines = slice.split(/\r?\n/);
  const rows = [];
  let header = null;
  for (const line of lines) {
    if (/^##\s+Resumen/i.test(line.trim()) || line.trim() === "---") break;
    const cells = rowToCells(line);
    if (!cells) continue;
    if (!header) {
      const upper = cells.map((c) => c.toUpperCase());
      if (!upper.includes("DNI") || !upper.includes("APELLIDO")) continue;
      header = upper;
      continue;
    }
    if (isSeparatorRow(cells)) continue;
    const obj = {};
    cells.forEach((c, i) => {
      obj[header[i] ?? `col${i}`] = c;
    });
    rows.push(obj);
  }
  return rows;
}

function parseIsoDate(raw) {
  const s = String(raw ?? "").trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (y < 1990 || y > 2030 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return s;
}

/** Edad cumplida al 31/12 (misma lógica que category.ts). */
function ageOnReferenceDate(isoDate, seasonYear) {
  const [by, bm, bd] = isoDate.split("-").map(Number);
  let age = seasonYear - by;
  const monthDiff = 12 - bm;
  if (monthDiff < 0 || (monthDiff === 0 && 31 < bd)) age -= 1;
  return age;
}

async function fetchAll(table, select, filters = (q) => q) {
  const PAGE = 1000;
  const out = [];
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from(table).select(select).range(from, from + PAGE - 1);
    q = filters(q);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

async function main() {
  const mdRows = readMdTable(PADRON_PATH);
  const byHash = new Map();
  let skippedNoDate = 0;
  let skippedNoDni = 0;
  for (const r of mdRows) {
    const dni = cleanDni(r.DNI);
    const birthDate =
      parseIsoDate(r["FECHA DE NACIMIENTO"]) ||
      parseIsoDate(r.FECHA_NACIMIENTO) ||
      parseIsoDate(r.NACIMIENTO);
    if (!dni) {
      skippedNoDni++;
      continue;
    }
    if (!birthDate) {
      skippedNoDate++;
      continue;
    }
    const hash = hashDniForLookup(dni);
    byHash.set(hash, {
      dni,
      birthDate,
      birthYear: Number(birthDate.slice(0, 4)),
      ageDec31: ageOnReferenceDate(birthDate, SEASON_YEAR),
      label: `${r.APELLIDO ?? ""} ${r.NOMBRES ?? r.NOMBRE ?? ""}`.trim(),
    });
  }

  console.log(
    `Padrón: ${byHash.size} DNIs con fecha (${PADRON_PATH})` +
      (skippedNoDate || skippedNoDni
        ? ` · omitidos sin DNI=${skippedNoDni} sin fecha=${skippedNoDate}`
        : "")
  );
  console.log(APPLY ? "Modo: APPLY (escribe en DB)" : "Modo: DRY-RUN (no escribe)");

  const players = await fetchAll(
    "Player",
    "id,firstName,lastName,birthDate,birthYear,dniHash",
    (q) => q.not("dniHash", "is", null)
  );
  const enrollments = await fetchAll(
    "YouthEnrollment",
    "id,firstName,lastName,birthDate,ageDec31,dniHash,seasonYear",
    (q) => q.eq("seasonYear", SEASON_YEAR)
  );
  const regs = await fetchAll(
    "YouthTournamentRegistration",
    "id,firstName,lastName,birthDate,ageAtSignup,dniHash"
  );

  const stats = {
    playerUpdate: 0,
    playerSame: 0,
    playerNoMatch: 0,
    enrollmentUpdate: 0,
    enrollmentSame: 0,
    enrollmentNoMatch: 0,
    regUpdate: 0,
    regSame: 0,
    regNoMatch: 0,
  };

  const playerUpdates = [];
  for (const p of players) {
    const src = byHash.get(p.dniHash);
    if (!src) {
      if (String(p.id).startsWith("player_youth_")) stats.playerNoMatch++;
      continue;
    }
    const cur = String(p.birthDate ?? "").slice(0, 10);
    if (cur === src.birthDate && p.birthYear === src.birthYear) {
      stats.playerSame++;
      continue;
    }
    stats.playerUpdate++;
    playerUpdates.push({
      id: p.id,
      from: cur || "(null)",
      to: src.birthDate,
      name: `${p.lastName} ${p.firstName}`,
      birthYear: src.birthYear,
    });
  }

  const enrollmentUpdates = [];
  for (const e of enrollments) {
    const src = byHash.get(e.dniHash);
    if (!src) {
      stats.enrollmentNoMatch++;
      continue;
    }
    const cur = String(e.birthDate ?? "").slice(0, 10);
    if (cur === src.birthDate && e.ageDec31 === src.ageDec31) {
      stats.enrollmentSame++;
      continue;
    }
    stats.enrollmentUpdate++;
    enrollmentUpdates.push({
      id: e.id,
      from: cur || "(null)",
      to: src.birthDate,
      name: `${e.lastName} ${e.firstName}`,
      ageDec31: src.ageDec31,
    });
  }

  const regUpdates = [];
  for (const r of regs) {
    const src = byHash.get(r.dniHash);
    if (!src) {
      stats.regNoMatch++;
      continue;
    }
    const cur = String(r.birthDate ?? "").slice(0, 10);
    const ageAtSignup = ageOnReferenceDate(src.birthDate, new Date().getFullYear());
    if (cur === src.birthDate) {
      stats.regSame++;
      continue;
    }
    stats.regUpdate++;
    regUpdates.push({
      id: r.id,
      from: cur || "(null)",
      to: src.birthDate,
      name: `${r.lastName} ${r.firstName}`,
      ageAtSignup,
    });
  }

  console.log("\nResumen:");
  console.log(
    `  Player:              actualizar=${stats.playerUpdate} igual=${stats.playerSame} youth-sin-match=${stats.playerNoMatch}`
  );
  console.log(
    `  YouthEnrollment:     actualizar=${stats.enrollmentUpdate} igual=${stats.enrollmentSame} sin-match=${stats.enrollmentNoMatch}`
  );
  console.log(
    `  YouthTournamentReg:  actualizar=${stats.regUpdate} igual=${stats.regSame} sin-match=${stats.regNoMatch}`
  );

  const sample = [...playerUpdates].slice(0, 8);
  if (sample.length) {
    console.log("\nEjemplos Player:");
    for (const u of sample) {
      console.log(`  ${u.name}: ${u.from} → ${u.to}`);
    }
    if (playerUpdates.length > sample.length) {
      console.log(`  … y ${playerUpdates.length - sample.length} más`);
    }
  }

  if (!APPLY) {
    console.log("\nDry-run OK. Reejecutá con --apply para escribir.");
    return;
  }

  const now = new Date().toISOString();
  let ok = 0;
  for (const u of playerUpdates) {
    const { error } = await supabase
      .from("Player")
      .update({
        birthDate: u.to,
        birthYear: u.birthYear,
        updatedAt: now,
      })
      .eq("id", u.id);
    if (error) throw new Error(`Player ${u.id}: ${error.message}`);
    ok++;
  }
  console.log(`\nPlayer actualizados: ${ok}`);

  ok = 0;
  for (const u of enrollmentUpdates) {
    const { error } = await supabase
      .from("YouthEnrollment")
      .update({
        birthDate: u.to,
        ageDec31: u.ageDec31,
        updatedAt: now,
      })
      .eq("id", u.id);
    if (error) throw new Error(`YouthEnrollment ${u.id}: ${error.message}`);
    ok++;
  }
  console.log(`YouthEnrollment actualizados: ${ok}`);

  ok = 0;
  for (const u of regUpdates) {
    const { error } = await supabase
      .from("YouthTournamentRegistration")
      .update({
        birthDate: u.to,
        ageAtSignup: u.ageAtSignup,
        updatedAt: now,
      })
      .eq("id", u.id);
    if (error) throw new Error(`YouthTournamentRegistration ${u.id}: ${error.message}`);
    ok++;
  }
  console.log(`YouthTournamentRegistration actualizados: ${ok}`);
  console.log("Listo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
