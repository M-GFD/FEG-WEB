-- World Handicap System (WHS): datos del tee del torneo para Course Handicap correcto.
ALTER TABLE "Tournament" ADD COLUMN IF NOT EXISTS "whsSlopeRating" INTEGER;
ALTER TABLE "Tournament" ADD COLUMN IF NOT EXISTS "whsCourseRating" DOUBLE PRECISION;
ALTER TABLE "Tournament" ADD COLUMN IF NOT EXISTS "whsPar" INTEGER;
