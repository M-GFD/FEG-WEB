import { auth } from "@/lib/auth";
import { fetchSiteNotificationsForUser } from "@/lib/site-notifications";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const notifications = await fetchSiteNotificationsForUser(session.user.id);
    return Response.json({ ok: true, notifications });
  } catch (e) {
    console.error("[api/site-notifications GET]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
