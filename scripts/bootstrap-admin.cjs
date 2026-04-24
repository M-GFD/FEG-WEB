try {
  require("dotenv").config({ path: ".env.local" });
} catch {
  /* dotenv opcional */
}
try {
  require("dotenv").config({ path: ".env" });
} catch {
  /* dotenv opcional */
}

/**
 * Crea o actualiza un usuario ADMIN con email verificado (primer acceso al panel).
 *
 * Uso (PowerShell, desde la raíz del repo):
 *   $env:ADMIN_EMAIL="tu@email.com"
 *   $env:ADMIN_PASSWORD="tu_contraseña_segura"
 *   npm run bootstrap-admin
 *
 * Orden de intentos:
 * 1) Supabase REST (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) — suele funcionar aunque Prisma falle.
 * 2) Prisma (DATABASE_URL) — si la conexión directa a Postgres es válida.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function bootstrapViaSupabase(email, hashed) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, reason: "missing_env" };

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const now = new Date().toISOString();

  const { data: row, error: selErr } = await supabase
    .from("User")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (selErr) {
    return { ok: false, reason: "supabase_error", message: selErr.message };
  }

  if (row?.id) {
    const { error } = await supabase
      .from("User")
      .update({
        password: hashed,
        role: "ADMIN",
        emailVerified: now,
        mustChangePassword: false,
        updatedAt: now,
      })
      .eq("email", email);
    if (error) {
      return { ok: false, reason: "supabase_error", message: error.message };
    }
    return { ok: true, via: "supabase-update", email };
  }

  const { error } = await supabase.from("User").insert({
    id: crypto.randomUUID(),
    email,
    password: hashed,
    name: email.split("@")[0],
    role: "ADMIN",
    clubId: null,
    mustChangePassword: false,
    emailVerified: now,
    createdAt: now,
    updatedAt: now,
  });

  if (error) {
    return { ok: false, reason: "supabase_error", message: error.message };
  }
  return { ok: true, via: "supabase-insert", email };
}

async function bootstrapViaPrisma(email, hashed) {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        password: hashed,
        name: email.split("@")[0],
        role: "ADMIN",
        emailVerified: new Date(),
        mustChangePassword: false,
      },
      update: {
        password: hashed,
        role: "ADMIN",
        emailVerified: new Date(),
        mustChangePassword: false,
      },
    });
    return { ok: true, via: "prisma", email: user.email };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const email = String(process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");

  if (!email || !password) {
    console.error("Definí ADMIN_EMAIL y ADMIN_PASSWORD en el entorno.");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("La contraseña debe tener al menos 6 caracteres.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const supa = await bootstrapViaSupabase(email, hashed);
  if (supa.ok) {
    console.log(
      `Listo (${supa.via}). Iniciá sesión en /auth/signin como:`,
      supa.email
    );
    return;
  }

  if (supa.reason === "supabase_error") {
    console.error("Supabase:", supa.message);
  }

  try {
    const prismaRes = await bootstrapViaPrisma(email, hashed);
    if (prismaRes.ok) {
      console.log(
        `Listo (${prismaRes.via}). Iniciá sesión en /auth/signin como:`,
        prismaRes.email
      );
      return;
    }
  } catch (e) {
    console.error("Prisma:", e.message || e);
  }

  console.error(`
No se pudo crear el administrador.

- Si usás Supabase: verificá NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env / .env.local
  (mismas variables que usa la app).

- Si querés usar solo Prisma: el error "Tenant or user not found" suele indicar DATABASE_URL incorrecta.
  En Supabase, copiá la cadena "URI" de Postgres (usuario postgres + contraseña del proyecto)
  y usá el host del pooler o directo según la doc de Prisma + Supabase.

Volvé a ejecutar: npm run bootstrap-admin
`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
