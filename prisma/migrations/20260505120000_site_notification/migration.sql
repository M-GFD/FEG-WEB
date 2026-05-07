-- Notificaciones in-app (panel Prensa). Listado en header para usuarios logueados; leído por usuario.
CREATE TABLE IF NOT EXISTS "SiteNotification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "linkUrl" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SiteNotificationRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteNotificationRead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SiteNotificationRead_userId_notificationId_key" ON "SiteNotificationRead"("userId", "notificationId");

CREATE INDEX IF NOT EXISTS "SiteNotificationRead_userId_idx" ON "SiteNotificationRead"("userId");

CREATE INDEX IF NOT EXISTS "SiteNotification_createdAt_idx" ON "SiteNotification"("createdAt" DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SiteNotificationRead_notificationId_fkey'
  ) THEN
    ALTER TABLE "SiteNotificationRead"
      ADD CONSTRAINT "SiteNotificationRead_notificationId_fkey"
      FOREIGN KEY ("notificationId") REFERENCES "SiteNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
