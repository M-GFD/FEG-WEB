-- Overrides del calendario anual público (cancelar / suspender / reprogramar).
CREATE TYPE "CalendarDateStatus" AS ENUM ('SCHEDULED', 'RESCHEDULED', 'SUSPENDED', 'CANCELLED');

CREATE TABLE "CalendarDateOverride" (
    "id" TEXT NOT NULL,
    "status" "CalendarDateStatus" NOT NULL,
    "month" INTEGER,
    "day" INTEGER,
    "dayEnd" INTEGER,
    "rangeStyle" TEXT,
    "year" INTEGER,
    "sede" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarDateOverride_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CalendarDateOverride" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "CalendarDateOverride" FROM anon, authenticated;
GRANT ALL ON TABLE "CalendarDateOverride" TO service_role;
GRANT ALL ON TABLE "CalendarDateOverride" TO postgres;
