-- CreateEnum
CREATE TYPE "ContentAudience" AS ENUM ('GENERAL', 'MENORES', 'MAYORES');

-- AlterTable
ALTER TABLE "News" ADD COLUMN "audience" "ContentAudience" NOT NULL DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN "audience" "ContentAudience" NOT NULL DEFAULT 'GENERAL';
