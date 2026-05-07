-- Ocultar en el menú las notificaciones ya leídas por usuario (dismissedAt).
ALTER TABLE "SiteNotificationRead" ADD COLUMN IF NOT EXISTS "dismissedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "SiteNotificationRead_userId_dismissedAt_idx" ON "SiteNotificationRead"("userId", "dismissedAt");
