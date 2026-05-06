-- Rondas publicadas para cálculo automático WHS del Handicap Index.
CREATE TABLE IF NOT EXISTS "PublishedHandicapRound" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "tournamentEntryId" TEXT NOT NULL,
  "playedAt" DATE NOT NULL,
  "gross" INTEGER NOT NULL,
  "adjustedGross" INTEGER NOT NULL,
  "differential" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PublishedHandicapRound_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PublishedHandicapRound_tournamentEntryId_key" UNIQUE ("tournamentEntryId"),
  CONSTRAINT "PublishedHandicapRound_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PublishedHandicapRound_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "PublishedHandicapRound_playerId_playedAt_idx" ON "PublishedHandicapRound" ("playerId", "playedAt" DESC);
