import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type SiteNotificationDTO = {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  createdAt: string;
  read: boolean;
};

const LIST_LIMIT = 40;

function mapPrismaInsertError(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2021") {
      return "Falta crear las tablas en la base (migración SiteNotification). Revisá Supabase o ejecutá prisma migrate deploy.";
    }
    console.error("[SiteNotification] insert", e.code, e.message);
    return "No se pudo guardar la notificación. Revisá los logs del servidor.";
  }
  console.error("[SiteNotification] insert", e);
  return "No se pudo guardar la notificación";
}

export async function fetchSiteNotificationsForUser(userId: string): Promise<SiteNotificationDTO[]> {
  try {
    const notifs = await prisma.siteNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
      select: {
        id: true,
        title: true,
        body: true,
        linkUrl: true,
        createdAt: true,
      },
    });

    if (notifs.length === 0) {
      return [];
    }

    const reads = await prisma.siteNotificationRead.findMany({
      where: { userId },
      select: { notificationId: true },
    });
    const readSet = new Set(reads.map((r) => r.notificationId));

    return notifs.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      linkUrl: n.linkUrl,
      createdAt: n.createdAt.toISOString(),
      read: readSet.has(n.id),
    }));
  } catch (e) {
    console.error("[SiteNotification] fetch", e);
    return [];
  }
}

export async function insertSiteNotification(params: {
  title: string;
  body: string | null;
  linkUrl: string | null;
  createdByUserId: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const row = await prisma.siteNotification.create({
      data: {
        title: params.title,
        body: params.body,
        linkUrl: params.linkUrl,
        createdByUserId: params.createdByUserId,
      },
    });
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: mapPrismaInsertError(e) };
  }
}

export async function markSiteNotificationReadForUser(
  userId: string,
  notificationId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await prisma.siteNotificationRead.upsert({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        },
      },
      create: {
        userId,
        notificationId,
      },
      update: {
        readAt: new Date(),
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[SiteNotificationRead] upsert", e);
    return { ok: false, error: "Error al marcar como leída" };
  }
}
