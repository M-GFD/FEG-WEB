import { auth } from "@/lib/auth";
import { siteNotificationsDismissSchema } from "@/lib/api-input-schemas";
import {
  PUBLIC_ERROR_GENERIC,
  PUBLIC_ERROR_VALIDATION,
  logServerError,
} from "@/lib/public-api-error";
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

    const parsed = siteNotificationsDismissSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ ok: false, error: PUBLIC_ERROR_VALIDATION }, { status: 400 });
    }

    const result = await dismissSiteNotificationForUser(session.user.id, parsed.data.notificationId);
    if (!result.ok) {
      logServerError("dismiss", result.error);
      return Response.json({ ok: false, error: PUBLIC_ERROR_GENERIC }, { status: 500 });
    }

    return Response.json(
      { ok: true },
      {
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  } catch (e) {
    logServerError("[api/site-notifications/dismiss POST]", e);
    return Response.json({ ok: false, error: PUBLIC_ERROR_GENERIC }, { status: 500 });
  }
}
