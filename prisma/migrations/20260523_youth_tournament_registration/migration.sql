-- Configuración de torneo activo para inscripciones menores
CREATE TABLE "YouthTournamentSignupConfig" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "extraLine" TEXT,
    "venue" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "sede" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "tournamentKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouthTournamentSignupConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "YouthTournamentSignupConfig_tournamentKey_key" ON "YouthTournamentSignupConfig"("tournamentKey");

-- Inscripciones a torneos menores
CREATE TABLE "YouthTournamentRegistration" (
    "id" TEXT NOT NULL,
    "tournamentKey" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "dniHash" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "responsiblePhoneEnc" TEXT NOT NULL,
    "responsibleEmailEnc" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "clubOther" TEXT,
    "clubId" TEXT,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "hasHandicap" BOOLEAN NOT NULL,
    "matricula" TEXT,
    "birthDate" DATE NOT NULL,
    "ageAtSignup" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "playsPrejuvenilesAlso" BOOLEAN NOT NULL DEFAULT false,
    "isPrincipiante" BOOLEAN NOT NULL DEFAULT false,
    "dietaryRestriction" BOOLEAN NOT NULL,
    "dietaryFoods" TEXT,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouthTournamentRegistration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "YouthTournamentRegistration_tournamentKey_dniHash_key" ON "YouthTournamentRegistration"("tournamentKey", "dniHash");
CREATE INDEX "YouthTournamentRegistration_tournamentKey_idx" ON "YouthTournamentRegistration"("tournamentKey");
CREATE INDEX "YouthTournamentRegistration_clubId_idx" ON "YouthTournamentRegistration"("clubId");

ALTER TABLE "YouthTournamentRegistration" ADD CONSTRAINT "YouthTournamentRegistration_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "YouthTournamentSignupConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "YouthTournamentRegistration" ENABLE ROW LEVEL SECURITY;
