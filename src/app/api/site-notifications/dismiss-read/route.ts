import { auth } from "@/lib/auth";
import { dismissReadSiteNotificationsForUser } from "@/lib/site-notifications";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const result = await dismissReadSiteNotificationsForUser(session.user.id);
    if (!result.ok) {
      return Response.json(
        { ok: false, error: result.error ?? "Error" },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, dismissed: result.dismissed ?? 0 });
  } catch (e) {
    console.error("[api/site-notifications/dismiss-read POST]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
