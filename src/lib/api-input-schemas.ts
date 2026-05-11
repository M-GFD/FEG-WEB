import { z } from "zod";

/** POST /api/site-notifications/mark-read */
export const siteNotificationsMarkReadSchema = z.object({
  notificationIds: z.array(z.string().min(1).max(128)).max(80),
});

/** POST /api/site-notifications/dismiss */
export const siteNotificationsDismissSchema = z.object({
  notificationId: z.string().min(1).max(128),
});

/** POST /api/preview-gate */
export const previewGateBodySchema = z.object({
  password: z.string().max(500),
});
