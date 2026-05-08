import { auth } from "@/lib/auth";
import { dismissSiteNotificationForUser } from "@/lib/site-notifications";

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

    const notificationId =
      body && typeof body === "object" && "notificationId" in body
        ? String((body as { notificationId?: unknown }).notificationId ?? "").trim()
        : "";

    if (!notificationId) {
      return Response.json({ ok: false, error: "notificationId requerido" }, { status: 400 });
    }

    const result = await dismissSiteNotificationForUser(session.user.id, notificationId);
    if (!result.ok) {
      return Response.json(
        { ok: false, error: result.error ?? "Error" },
        { status: 500 }
      );
    }

    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (e) {
    console.error("[api/site-notifications/dismiss POST]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
