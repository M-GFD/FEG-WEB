-- Hash de DNI para búsqueda O(1) en padrón Player (empadronamiento web + import FGL)
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "dniHash" TEXT;

CREATE INDEX IF NOT EXISTS "Player_dniHash_idx" ON "Player"("dniHash");
