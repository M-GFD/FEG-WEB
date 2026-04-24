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
 *   node scripts/bootstrap-admin.cjs
 *
 * Requiere DATABASE_URL válido (misma cadena que usás con Prisma / Supabase).
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

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

  const prisma = new PrismaClient();
  const hashed = await bcrypt.hash(password, 12);

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

  console.log("Listo. Podés iniciar sesión en /auth/signin como:", user.email);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
