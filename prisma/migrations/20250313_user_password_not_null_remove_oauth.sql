-- Migración: User.password NOT NULL + eliminar OAuth (Account, Session)
-- Aplicada: 2025-03-13
-- Ejecutada en Supabase vía MCP

-- 1. User.password → NOT NULL (no hay usuarios OAuth)
UPDATE "User" SET password = '' WHERE password IS NULL;
ALTER TABLE "User" ALTER COLUMN password SET NOT NULL;

-- 2. Eliminar tablas OAuth
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
