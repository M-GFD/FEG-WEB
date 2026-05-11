import { auth } from "@/lib/auth";
import { canModeratePress } from "@/lib/rbac";
import { PUBLIC_ERROR_GENERIC, logServerError } from "@/lib/public-api-error";
import { publishNewsArticle } from "@/lib/publish-news";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !canModeratePress(session.user.role)) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return Response.json({ ok: false, error: "JSON inválido" }, { status: 400 });
    }

    const result = await publishNewsArticle(session.user.id, json);
    if (result.ok) {
      return Response.json({ ok: true, slug: result.slug });
    }
    if (result.status >= 500) {
      return Response.json({ ok: false, error: PUBLIC_ERROR_GENERIC }, { status: result.status });
    }
    const payload: { ok: false; error: string; code?: string } = {
      ok: false,
      error: result.error,
    };
    if (result.code) {
      payload.code = result.code;
    }
    return Response.json(payload, { status: result.status });
  } catch (e) {
    logServerError("[api/news POST]", e);
    return Response.json({ ok: false, error: PUBLIC_ERROR_GENERIC }, { status: 500 });
  }
}
