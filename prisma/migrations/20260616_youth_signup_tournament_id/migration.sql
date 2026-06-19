-- Vincula torneo activo de inscripciones menores con Tournament (eliminación en cascada lógica desde la app).
ALTER TABLE "YouthTournamentSignupConfig"
  ADD COLUMN IF NOT EXISTS "tournamentId" TEXT;

CREATE INDEX IF NOT EXISTS "YouthTournamentSignupConfig_tournamentId_idx"
  ON "YouthTournamentSignupConfig" ("tournamentId");
