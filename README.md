# FEG Platform — Federación de Golf

PWA para torneos, rankings, resultados y gestión administrativa.

## Stack

- **Next.js 15** (App Router)
- **Prisma** + PostgreSQL (Supabase)
- **NextAuth v5** (Auth.js)
- **Tailwind CSS**
- **Zod** (validación)

## Setup

1. Copiar `.env.example` a `.env.local`
2. Configurar `DATABASE_URL` y `DIRECT_URL` con las credenciales de Supabase
3. Generar `AUTH_SECRET`: `npx auth secret`
4. Instalar dependencias: `npm install`
5. Generar Prisma client: `npm run db:generate`
6. Aplicar schema: `npm run db:push`
7. Ejecutar: `npm run dev`

## Estructura

- `src/app/` — Páginas (App Router)
- `src/components/` — Componentes reutilizables
- `src/lib/` — DB, auth, utilidades
- `prisma/` — Schema y migraciones

## Roles

- **PUBLIC** — Sin acceso a dashboards
- **CLUB** — Cargar scores, subir fotos, enviar gastos
- **PRESS** — Aprobar fotos, publicar noticias
- **DIRECTOR** — Ver estado general
- **TREASURER** — Aprobar/rechazar gastos
- **ADMIN** — Acceso total

## Documentación

Ver `docs/` para especificaciones de producto, UX de score entry y reglamento.
