/**
 * Importa el padrón histórico FGL 2026 (planilla markdown) a Player.
 * Uso puntual / actualización de planilla; NO hace falta para quien se empadrona por la web
 * (el formulario guarda en YouthEnrollment y sincroniza Player automáticamente).
 *
 * Uso: npm run import-youth-padron
 * Requiere: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PLAYER_DATA_ENCRYPTION_KEY
 */

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local", override: true });

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KEY_RAW = (process.env.PLAYER_DATA_ENCRYPTION_KEY ?? "").trim();
const PADRON_PATH =
  process.env.FEG_YOUTH_PADRON_MD ||
  path.join(__dirname, "..", "docs", "empadronamiento-fgl-2026-migracion.md");

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

function hashDniForLookup(canonicalDni) {
  if (!canonicalDni) return "";
  return crypto
    .createHash("sha256")
    .update(`feg-youth-enrollment:${canonicalDni}`)
    .digest("hex");
}

function encryptSensitive(plain) {
  const value = String(plain).trim();
  if (!value) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const ct = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `gcm:v1:${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

function normalize(s) {
  return String(s ?? "").trim().replace(/\s+/g, " ");
}
function titleCase(s) {
  if (!s) return s;
  return String(s)
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-záéíóúüñ])/gi, (_m, p, c) => p + c.toUpperCase());
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
  return { rows };
}

function matchClub(clubName, clubs) {
  const n = clubName.trim().toUpperCase();
  if (!n) return null;
  const exact = clubs.find((c) => c.name.trim().toUpperCase() === n);
  if (exact) return exact;
  const partial = clubs.find((c) => {
    const cn = c.name.trim().toUpperCase();
    return cn.includes(n) || n.includes(cn);
  });
  return partial ?? null;
}

function slugId(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

function birthYearFromCategory(cat) {
  const k = normalize(cat).toLowerCase();
  if (k.includes("sub 23") || k.includes("sub23")) return 2003;
  if (k.includes("juvenil") && !k.includes("pre")) return 2009;
  if (k.includes("pre")) return 2013;
  if (k.includes("albatros")) return 2013;
  if (k.includes("aguila") || k.includes("águila")) return 2015;
  if (k.includes("birdie")) return 2017;
  if (k.includes("principiante")) return 2018;
  return 2010;
}

function mapGender(sexo) {
  const s = normalize(sexo).toLowerCase();
  if (s.startsWith("muj") || s === "f") return "F";
  return "M";
}

function playerId(dni, lastName, firstName) {
  const h = crypto
    .createHash("sha1")
    .update(`${dni}|${lastName}|${firstName}`)
    .digest("hex")
    .slice(0, 10);
  return `player_youth_${h}`;
}

async function ensureClub(clubName, clubs) {
  const matched = matchClub(clubName, clubs);
  if (matched) return matched;

  const id = `club_youth_${slugId(clubName)}`;
  const slug = slugId(clubName) || id.replace(/^club_/, "");
  const name = clubName.trim();
  const { error } = await supabase.from("Club").upsert(
    { id, name, slug, code: null, updatedAt: new Date().toISOString() },
    { onConflict: "id" }
  );
  if (error) throw new Error(`Club ${name}: ${error.message}`);
  const created = { id, name, code: null };
  clubs.push(created);
  console.log(`  [+] Club creado: ${name} (${id})`);
  return created;
}

async function main() {
  if (!fs.existsSync(PADRON_PATH)) {
    console.error("[!] No existe:", PADRON_PATH);
    process.exit(1);
  }

  const { rows } = readMdTable(PADRON_PATH);
  const players = rows
    .map((r) => {
      const dni = cleanDni(r.DNI);
      const lastName = titleCase(normalize(r.APELLIDO));
      const firstName = titleCase(normalize(r.NOMBRES ?? r.NOMBRE));
      const category = normalize(r.CATEGORÍA ?? r.CATEGORIA) || null;
      const clubName = normalize(r.CLUB);
      if (!dni || !lastName || !firstName || !clubName) return null;
      const birthDateRaw = String(
        r["FECHA DE NACIMIENTO"] ?? r.FECHA_NACIMIENTO ?? ""
      )
        .trim()
        .slice(0, 10);
      const hasRealBirth =
        /^\d{4}-\d{2}-\d{2}$/.test(birthDateRaw) &&
        Number(birthDateRaw.slice(0, 4)) >= 1990;
      const birthYear = hasRealBirth
        ? Number(birthDateRaw.slice(0, 4))
        : birthYearFromCategory(category || "");
      return {
        id: playerId(dni, lastName, firstName),
        dni,
        lastName,
        firstName,
        gender: mapGender(r.SEXO),
        category: category === "—" || category === "-" ? null : category,
        clubName,
        birthYear,
        birthDate: hasRealBirth ? birthDateRaw : `${birthYear}-06-15`,
      };
    })
    .filter(Boolean);

  console.log(`Padrón menores: ${players.length} filas en ${PADRON_PATH}`);

  const { data: clubRows, error: clubErr } = await supabase
    .from("Club")
    .select("id,name,code");
  if (clubErr) throw new Error(clubErr.message);
  const clubs = [...(clubRows ?? [])];

  const seen = new Set();
  const rowsToUpsert = [];
  for (const p of players) {
    const dedupeKey = `${p.firstName}|${p.lastName}|${p.clubName}`;
    if (seen.has(dedupeKey)) {
      console.warn(`  [!] Duplicado omitido: ${p.lastName} ${p.firstName} (${p.clubName})`);
      continue;
    }
    seen.add(dedupeKey);
    const club = await ensureClub(p.clubName, clubs);

    const { data: existing } = await supabase
      .from("Player")
      .select("id")
      .eq("firstName", p.firstName)
      .eq("lastName", p.lastName)
      .eq("clubId", club.id)
      .maybeSingle();

    rowsToUpsert.push({
      id: existing?.id ?? p.id,
      matricula: null,
      firstName: p.firstName,
      lastName: p.lastName,
      handicap: 0,
      handicapIndex: null,
      category: p.category,
      birthYear: p.birthYear,
      birthDate: p.birthDate,
      gender: p.gender,
      clubId: club.id,
      dniEnc: encryptSensitive(p.dni),
      dniHash: hashDniForLookup(p.dni),
      updatedAt: new Date().toISOString(),
    });
  }

  const CHUNK = 40;
  let ok = 0;
  for (let i = 0; i < rowsToUpsert.length; i += CHUNK) {
    const chunk = rowsToUpsert.slice(i, i + CHUNK);
    const { error } = await supabase.from("Player").upsert(chunk, { onConflict: "id" });
    if (error) throw new Error(error.message);
    ok += chunk.length;
    process.stdout.write(`  [+] ${ok}/${rowsToUpsert.length}\r`);
  }
  console.log(`\nListo: ${ok} jugadores menores importados con DNI cifrado.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
