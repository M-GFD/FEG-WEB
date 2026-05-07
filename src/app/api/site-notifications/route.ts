import { auth } from "@/lib/auth";
import { fetchSiteNotificationsList } from "@/lib/site-notifications";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const notifications = await fetchSiteNotificationsList(userId);
    return Response.json({ ok: true, notifications });
  } catch (e) {
    console.error("[api/site-notifications GET]", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Error interno" },
      { status: 500 }
    );
  }
}
