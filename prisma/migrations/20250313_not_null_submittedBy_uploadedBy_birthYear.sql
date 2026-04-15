-- Migración: Expense.submittedBy, Photo.uploadedBy, Player.birthYear → NOT NULL
-- Aplicada: 2025-03-13
-- Ejecutada en Supabase vía MCP

-- 1. Actualizar filas existentes con NULL
UPDATE "Player" SET "birthYear" = 1900 WHERE "birthYear" IS NULL;
UPDATE "Expense" SET "submittedBy" = (SELECT id FROM "User" LIMIT 1) WHERE "submittedBy" IS NULL;
UPDATE "Photo" SET "uploadedBy" = (SELECT id FROM "User" LIMIT 1) WHERE "uploadedBy" IS NULL;

-- 2. Aplicar NOT NULL y default para birthYear
ALTER TABLE "Player" ALTER COLUMN "birthYear" SET NOT NULL;
ALTER TABLE "Player" ALTER COLUMN "birthYear" SET DEFAULT 1900;

ALTER TABLE "Expense" ALTER COLUMN "submittedBy" SET NOT NULL;

ALTER TABLE "Photo" ALTER COLUMN "uploadedBy" SET NOT NULL;
