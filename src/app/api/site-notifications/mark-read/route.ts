import { auth } from "@/lib/auth";
import { markSiteNotificationIdsReadForUser } from "@/lib/site-notifications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false, error: "JSON inválido" }, { status: 400 });
    }

    const rawIds =
      body &&
      typeof body === "object" &&
      "notificationIds" in body &&
      Array.isArray((body as { notificationIds: unknown }).notificationIds)
        ? (body as { notificationIds: unknown[] }).notificationIds
        : [];

    const ids = [
      ...new Set(
        rawIds
          .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
          .map((x) => x.trim())
      ),
    ];

    const result = await markSiteNotificationIdsReadForUser(session.user.id, ids);
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error ?? "Error" }, { status: 500 });
    }

    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (e) {
    console.error("[api/site-notifications/mark-read POST]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
