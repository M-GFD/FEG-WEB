/**
 * Import del padrón FEG → Supabase.
 *
 * Lee los .md desde la carpeta indicada (por defecto ~/Downloads),
 * parsea cada formato, cifra los datos sensibles y hace upsert en
 * la tabla public."Player" usando la clave de servicio de Supabase.
 *
 * Variables de entorno requeridas:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - PLAYER_DATA_ENCRYPTION_KEY (32 bytes en hex de 64 chars o base64)
 *
 * Variables opcionales:
 *   - FEG_DOWNLOADS_DIR (default: ~/Downloads)
 */

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

// ----- Config -----
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[!] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ----- Cifrado AES-256-GCM -----
const KEY_RAW = (process.env.PLAYER_DATA_ENCRYPTION_KEY ?? "").trim();
function loadKey() {
  if (!KEY_RAW) {
    throw new Error(
      "PLAYER_DATA_ENCRYPTION_KEY no está configurada. " +
        "Generá 32 bytes (ej: `node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"`) y guardalo en .env."
    );
  }
  let key = null;
  if (/^[0-9a-fA-F]+$/.test(KEY_RAW) && KEY_RAW.length === 64) {
    key = Buffer.from(KEY_RAW, "hex");
  } else {
    try {
      key = Buffer.from(KEY_RAW, "base64");
    } catch {
      key = null;
    }
  }
  if (!key || key.length !== 32) {
    throw new Error("PLAYER_DATA_ENCRYPTION_KEY inválida: se esperaban 32 bytes (64 hex o 44 base64).");
  }
  return key;
}
const KEY = loadKey();
function encryptSensitive(plain) {
  if (plain == null) return null;
  const value = String(plain).trim();
  if (!value) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `gcm:v1:${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

// ----- Utilidades -----
function titleCase(s) {
  if (!s) return s;
  return String(s)
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-záéíóúüñ])/gi, (_m, p, c) => p + c.toUpperCase());
}
function normalize(s) {
  return String(s ?? "").trim().replace(/\s+/g, " ");
}
function toFloat(s) {
  if (s == null) return null;
  const n = parseFloat(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function toInt(s) {
  if (s == null) return null;
  const n = parseInt(String(s), 10);
  return Number.isFinite(n) ? n : null;
}
function isFakeEmail(email) {
  if (!email) return true;
  if (/@nomail\.com$/i.test(email)) return true;
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function cleanPhone(raw) {
  if (!raw) return null;
  const t = String(raw).trim();
  if (t === "-" || t === "0") return null;
  const digits = t.replace(/[^\d]/g, "");
  if (digits.length < 6) return null;
  return digits;
}
function cleanDni(raw) {
  if (!raw) return null;
  const t = String(raw).trim();
  if (!/^-?\d+$/.test(t)) return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 1000) return null;
  return String(n);
}
function splitNameSimple(full) {
  const tokens = normalize(full).split(" ").filter(Boolean);
  if (tokens.length === 0) return { firstName: "", lastName: "" };
  if (tokens.length === 1) return { firstName: "", lastName: tokens[0] };
  return { lastName: tokens[0], firstName: tokens.slice(1).join(" ") };
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
  const lines = text.split(/\r?\n/);
  const rows = [];
  let header = null;
  for (const line of lines) {
    const cells = rowToCells(line);
    if (!cells) continue;
    if (!header) {
      header = cells.map((c) => c.toUpperCase());
      continue;
    }
    if (isSeparatorRow(cells)) continue;
    const obj = {};
    cells.forEach((c, i) => {
      obj[header[i] ?? `col${i}`] = c;
    });
    rows.push(obj);
  }
  return { header: header ?? [], rows };
}

// ----- Parsers por archivo -----
function parseEstudiantes(filePath, clubId) {
  const { rows } = readMdTable(filePath);
  return rows.map((r) => {
    const matricula = normalize(r["MATRÍCULA"] ?? r["MATRICULA"]);
    const apellido = titleCase(normalize(r["APELLIDO"]));
    const nombre = titleCase(normalize(r["NOMBRE"]));
    const index = toFloat(r["INDEX"]);
    const dni = cleanDni(r["DNI"]);
    const cel = cleanPhone(r["CEL"]);
    const correoRaw = normalize(r["CORREO"]);
    const correo = isFakeEmail(correoRaw) ? null : correoRaw;
    const fNacRaw = normalize(r["F. NACIMIENTO"]).split(" ")[0] || "";
    const birthDate = /^\d{4}-\d{2}-\d{2}$/.test(fNacRaw) ? fNacRaw : null;
    const edad = toInt(r["EDAD"]);
    const cat = normalize(r["CATEGORÍA"]);
    const gender = cat.toUpperCase().startsWith("DAM") ? "F" : "M";
    return {
      clubId,
      matricula: matricula || null,
      firstName: nombre || "(sin nombre)",
      lastName: apellido || "(sin apellido)",
      handicap: index != null ? Math.round(index) : 0,
      handicapIndex: index,
      gender,
      birthYear: birthDate ? parseInt(birthDate.slice(0, 4), 10) : 1900,
      birthDate,
      age: edad,
      category: cat || null,
      emailEnc: encryptSensitive(correo),
      phoneEnc: encryptSensitive(cel),
      dniEnc: encryptSensitive(dni),
    };
  });
}
function parseTermasVE(filePath, clubId, gender) {
  const { rows } = readMdTable(filePath);
  return rows.map((r) => {
    const matricula = normalize(r["MATRICULA"]);
    const nombre = titleCase(normalize(r["NOMBRE"]));
    const apellido = titleCase(normalize(r["APELLIDO"]));
    const idx = toFloat(r["HCP INDEX"]);
    const cancha = toFloat(r["HCP CANCHA"]);
    return {
      clubId,
      matricula: matricula || null,
      firstName: nombre || "(sin nombre)",
      lastName: apellido || "(sin apellido)",
      handicap: idx != null ? Math.round(idx) : 0,
      handicapIndex: idx,
      handicapCourse: cancha,
      califIda: toFloat(r["CALIF IDA"]),
      slopeIda: toInt(r["SLOPE IDA"]),
      califVta: toFloat(r["CALIF VTA"]),
      slopeVta: toInt(r["SLOPE VTA"]),
      califTotal: toFloat(r["CALIF TOTAL"]),
      slopeTotal: toInt(r["SLOPE TOTAL"]),
      gender,
      birthYear: 1900,
      category: gender === "F" ? "DAMA" : "CABALLERO",
    };
  });
}
function parseLaPaz(filePath, clubId) {
  const { rows } = readMdTable(filePath);
  return rows.map((r) => {
    const matricula = normalize(r["MATRICULA"]);
    const fullName = normalize(r["NOMBRE"]);
    const idx = toFloat(r["INDEX"]);
    const cat = normalize(r["CATEGORÍA"]);
    const gender = /dama/i.test(cat) ? "F" : "M";
    const split = splitNameSimple(fullName);
    return {
      clubId,
      matricula: matricula || null,
      firstName: titleCase(split.firstName) || "(sin nombre)",
      lastName: titleCase(split.lastName) || "(sin apellido)",
      handicap: idx != null ? Math.round(idx) : 0,
      handicapIndex: idx,
      gender,
      birthYear: 1900,
      category: cat || null,
    };
  });
}
function parseVillaguay(filePath, clubId) {
  const { rows } = readMdTable(filePath);
  return rows.map((r) => {
    const matricula = normalize(r["MATRICULA"]);
    const raw = normalize(r["NOMBRE"]);
    // Conservamos parénticos como (p) / (h) en el nombre para distinguir homónimos.
    const paren = (raw.match(/\(([^)]+)\)/g) || []).map((s) => s).join(" ");
    const stripped = raw.replace(/\([^)]*\)/g, "").trim();
    const split = splitNameSimple(stripped);
    let firstName = titleCase(split.firstName);
    if (paren) firstName = (firstName ? `${firstName} ${paren}` : paren).trim();
    return {
      clubId,
      matricula: matricula || null,
      firstName: firstName || "(sin nombre)",
      lastName: titleCase(split.lastName) || "(sin apellido)",
      handicap: 0,
      gender: "M",
      birthYear: 1900,
      category: null,
    };
  });
}

// ----- Inserción -----
function makeId(p) {
  if (p.matricula) return `player_${p.matricula}`;
  const h = crypto
    .createHash("sha1")
    .update(`${p.firstName}|${p.lastName}|${p.clubId}`)
    .digest("hex")
    .slice(0, 12);
  return `player_${p.clubId}_${h}`;
}

function toRow(p) {
  return {
    id: makeId(p),
    matricula: p.matricula ?? null,
    firstName: p.firstName,
    lastName: p.lastName,
    handicap: p.handicap ?? 0,
    handicapIndex: p.handicapIndex ?? null,
    handicapCourse: p.handicapCourse ?? null,
    califIda: p.califIda ?? null,
    slopeIda: p.slopeIda ?? null,
    califVta: p.califVta ?? null,
    slopeVta: p.slopeVta ?? null,
    califTotal: p.califTotal ?? null,
    slopeTotal: p.slopeTotal ?? null,
    category: p.category ?? null,
    birthYear: p.birthYear ?? 1900,
    birthDate: p.birthDate ?? null,
    age: p.age ?? null,
    gender: p.gender,
    clubId: p.clubId,
    emailEnc: p.emailEnc ?? null,
    phoneEnc: p.phoneEnc ?? null,
    dniEnc: p.dniEnc ?? null,
    updatedAt: new Date().toISOString(),
  };
}

async function upsertChunk(rows) {
  const { error } = await supabase.from("Player").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

async function main() {
  const dir = process.env.FEG_DOWNLOADS_DIR || path.join(os.homedir(), "Downloads");
  console.log("Importando padrones desde:", dir);

  const tasks = [
    { name: "Estudiantes Paraná",            file: "padron_club_atletico_estudiantes.md",     parse: (p) => parseEstudiantes(p, "club_302") },
    { name: "Termas Villa Elisa (Damas)",    file: "padron_damas_termas_villa_elisa.md",       parse: (p) => parseTermasVE(p, "club_354", "F") },
    { name: "Termas Villa Elisa (Caballeros)", file: "padron_caballeros_termas_villa_elisa.md", parse: (p) => parseTermasVE(p, "club_354", "M") },
    { name: "Golf Club Social La Paz",        file: "handicaps_golf_club_social_la_paz.md",     parse: (p) => parseLaPaz(p, "club_326") },
    { name: "Aero Club Villaguay",            file: "socios_hacp_villaguay.md",                 parse: (p) => parseVillaguay(p, "club_332") },
  ];

  let totalOk = 0;
  let totalErr = 0;
  const CHUNK = 50;

  for (const t of tasks) {
    const filePath = path.join(dir, t.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[!] No encontrado, salto: ${t.name} (${filePath})`);
      continue;
    }
    const players = t.parse(filePath);
    console.log(`> ${t.name}: ${players.length} jugadores`);
    const rows = players.map(toRow);

    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      try {
        await upsertChunk(chunk);
        totalOk += chunk.length;
        process.stdout.write(`  [+] ${i + chunk.length}/${rows.length}\r`);
      } catch (e) {
        totalErr += chunk.length;
        console.error(`\n  ! Error en chunk (${i}-${i + chunk.length}):`, e.message);
      }
    }
    process.stdout.write("\n");
  }

  console.log(`\nResumen → OK: ${totalOk}  ERR: ${totalErr}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
