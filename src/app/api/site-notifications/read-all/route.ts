import { auth } from "@/lib/auth";
import {
  markAllRecentSiteNotificationsReadForUser,
  markSiteNotificationIdsReadForUser,
} from "@/lib/site-notifications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    let notificationIds: string[] | null = null;
    try {
      const body = (await request.json()) as { notificationIds?: unknown } | null;
      if (
        body &&
        typeof body === "object" &&
        Array.isArray(body.notificationIds) &&
        body.notificationIds.length > 0
      ) {
        const raw = body.notificationIds as unknown[];
        notificationIds = [
          ...new Set(
            raw
              .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
              .map((x) => x.trim())
          ),
        ];
      }
    } catch {
      notificationIds = null;
    }

    const result =
      notificationIds && notificationIds.length > 0
        ? await markSiteNotificationIdsReadForUser(session.user.id, notificationIds)
        : await markAllRecentSiteNotificationsReadForUser(session.user.id);

    if (!result.ok) {
      return Response.json({ ok: false, error: result.error ?? "Error" }, { status: 500 });
    }

    return Response.json(
      { ok: true },
      {
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  } catch (e) {
    console.error("[api/site-notifications/read-all POST]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
