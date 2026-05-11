import { auth } from "@/lib/auth";
import { PUBLIC_ERROR_GENERIC, logServerError } from "@/lib/public-api-error";
import { fetchSiteNotificationsList } from "@/lib/site-notifications";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const notifications = await fetchSiteNotificationsList(userId);
    return Response.json(
      { ok: true, notifications },
      {
        headers: {
          "Cache-Control": "private, no-store, must-revalidate",
        },
      }
    );
  } catch (e) {
    logServerError("[api/site-notifications GET]", e);
    return Response.json({ ok: false, error: PUBLIC_ERROR_GENERIC }, { status: 500 });
  }
}
