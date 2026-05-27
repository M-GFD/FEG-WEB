-- Empadronamiento menores/juveniles (formulario web temporada anual)
CREATE TABLE "YouthEnrollment" (
    "id" TEXT NOT NULL,
    "seasonYear" INTEGER NOT NULL,
    "dniHash" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "responsiblePhoneEnc" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "ageDec31" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "dniEnc" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "phoneEnc" TEXT NOT NULL,
    "emailEnc" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "clubCode" TEXT,
    "clubId" TEXT,
    "school" TEXT,
    "hasHandicap" BOOLEAN NOT NULL,
    "matricula" TEXT,
    "professors" JSONB,
    "professorOther" TEXT,
    "tutor1Name" TEXT NOT NULL,
    "tutor1DniEnc" TEXT NOT NULL,
    "tutor1PhoneEnc" TEXT NOT NULL,
    "tutor1EmailEnc" TEXT NOT NULL,
    "tutor2Name" TEXT,
    "tutor2DniEnc" TEXT,
    "tutor2EmailEnc" TEXT,
    "healthData" JSONB NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YouthEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "YouthEnrollment_seasonYear_dniHash_key" ON "YouthEnrollment"("seasonYear", "dniHash");
CREATE INDEX "YouthEnrollment_seasonYear_idx" ON "YouthEnrollment"("seasonYear");
CREATE INDEX "YouthEnrollment_clubId_idx" ON "YouthEnrollment"("clubId");

ALTER TABLE "YouthEnrollment" ADD CONSTRAINT "YouthEnrollment_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "YouthEnrollment" ENABLE ROW LEVEL SECURITY;
