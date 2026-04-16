import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { canModeratePress } from "@/lib/rbac";
import { getSupabaseAdmin } from "@/lib/supabase";
import { slugifyTitle } from "@/lib/slugify";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { resolveUniqueNewsSlug } from "@/lib/news-db";

export const runtime = "nodejs";

const createBodySchema = z.object({
  title: z.string().min(1, "Título requerido").max(200),
  slug: z.string().max(100).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1, "El cuerpo de la noticia no puede estar vacío"),
  imageUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  galleryUrls: z.array(z.string().url()).max(30).optional(),
});

function isEffectivelyEmptyHtml(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return text.length === 0;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !canModeratePress(session.user.role)) {
      return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return Response.json(
        { ok: false, error: "Servidor sin conexión a la base de datos." },
        { status: 503 }
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return Response.json({ ok: false, error: "JSON inválido" }, { status: 400 });
    }

    const parsed = createBodySchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      const first = Object.values(msg).flat()[0] ?? "Datos inválidos";
      return Response.json({ ok: false, error: first }, { status: 400 });
    }

    const { title, slug: slugInput, excerpt, content, imageUrl, galleryUrls } =
      parsed.data;

    if (isEffectivelyEmptyHtml(content)) {
      return Response.json(
        { ok: false, error: "El cuerpo de la noticia no puede estar vacío" },
        { status: 400 }
      );
    }

    let sanitized: string;
    try {
      sanitized = sanitizeNewsContent(content);
    } catch (e) {
      console.error("[api/news POST] sanitize", e);
      return Response.json(
        {
          ok: false,
          error:
            e instanceof Error
              ? e.message
              : "No se pudo validar el HTML de la noticia.",
        },
        { status: 400 }
      );
    }

    if (isEffectivelyEmptyHtml(sanitized)) {
      return Response.json(
        { ok: false, error: "El contenido no tiene texto permitido tras la validación." },
        { status: 400 }
      );
    }

    const baseSlug = slugifyTitle(slugInput?.trim() || title);
    let finalSlug: string;
    try {
      finalSlug = await resolveUniqueNewsSlug(baseSlug);
    } catch (e) {
      return Response.json(
        { ok: false, error: e instanceof Error ? e.message : "Error de slug" },
        { status: 500 }
      );
    }

    const cover =
      imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== ""
        ? imageUrl.trim()
        : null;
    const gallery = (galleryUrls ?? []).filter(Boolean);
    /** JSON nullable: null evita posibles fricciones con array vacío en algunas instancias de Postgres/PostgREST */
    const galleryJson = gallery.length > 0 ? gallery : null;
    const now = new Date().toISOString();

    try {
      const { data: row, error } = await supabase
        .from("News")
        .insert({
          id: crypto.randomUUID(),
          title: title.trim(),
          slug: finalSlug,
          content: sanitized,
          excerpt: excerpt?.trim() ? excerpt.trim() : null,
          imageUrl: cover,
          galleryUrls: galleryJson,
          published: true,
          publishedAt: now,
          authorId: session.user.id,
          createdAt: now,
          updatedAt: now,
        })
        .select("slug")
        .single();

      if (error) {
        const detail = [error.message, error.hint, (error as { details?: string }).details]
          .filter(Boolean)
          .join(" — ");
        console.error("[api/news POST]", error);
        return Response.json(
          {
            ok: false,
            error: detail || "No se pudo guardar la noticia",
            code: (error as { code?: string }).code,
          },
          { status: 500 }
        );
      }

      if (!row?.slug) {
        return Response.json(
          { ok: false, error: "La noticia no devolvió slug." },
          { status: 500 }
        );
      }

      revalidatePath("/noticias");
      revalidatePath(`/noticias/${row.slug}`);

      return Response.json({ ok: true, slug: row.slug });
    } catch (e) {
      console.error("[api/news POST] unexpected", e);
      return Response.json(
        {
          ok: false,
          error: e instanceof Error ? e.message : "Error interno al publicar",
        },
        { status: 500 }
      );
    }
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
