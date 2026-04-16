import { auth } from "@/lib/auth";
import { canModeratePress } from "@/lib/rbac";
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
    return Response.json(
      { ok: false, error: result.error, code: result.code },
      { status: result.status }
    );
  } catch (e) {
    console.error("[api/news POST] fatal", e);
    return Response.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
