import { auth } from "@/lib/auth";
import { canModeratePress } from "@/lib/rbac";
import { PUBLIC_ERROR_GENERIC, logServerError } from "@/lib/public-api-error";
import { uploadNewsImage } from "@/lib/news-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !canModeratePress(session.user.role)) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json(
        { ok: false, error: "No se pudo leer el archivo." },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return Response.json({ ok: false, error: "Falta el archivo (campo file)." }, { status: 400 });
    }

    const result = await uploadNewsImage(file, session.user.id);
    if (!result.ok) {
      return Response.json(
        { ok: false, error: result.error ?? PUBLIC_ERROR_GENERIC },
        { status: 400 }
      );
    }

    return Response.json({ ok: true, url: result.url });
  } catch (e) {
    logServerError("[api/news/upload-image POST]", e);
    return Response.json({ ok: false, error: PUBLIC_ERROR_GENERIC }, { status: 500 });
  }
}
