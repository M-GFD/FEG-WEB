import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";
import { slugifyTitle } from "@/lib/slugify";
import { sanitizeNewsContent } from "@/lib/sanitize-news";
import { resolveUniqueNewsSlug } from "@/lib/news-db";
import { broadcastNewsPublishedPush } from "@/lib/push";

const createBodySchema = z.object({
  title: z.string().min(1, "Título requerido").max(200),
  slug: z.string().max(100).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1, "El cuerpo de la noticia no puede estar vacío"),
  imageUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  galleryUrls: z.array(z.string().url()).max(30).optional(),
  /** Si es true, envía Web Push a suscriptores PWA; por defecto no se notifica. */
  notifyPush: z.boolean().optional().default(false),
});

function isEffectivelyEmptyHtml(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return text.length === 0;
}

export type PublishNewsArticleResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; code?: string; status: number };

/**
 * Inserta una noticia publicada y revalida listados (home, /noticias, detalle).
 * Usado desde la Server Action de gestión y desde POST /api/news.
 */
export async function publishNewsArticle(
  authorId: string,
  json: unknown
): Promise<PublishNewsArticleResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Servidor sin conexión a la base de datos.", status: 503 };
  }

  const parsed = createBodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first = Object.values(msg).flat()[0] ?? "Datos inválidos";
    return { ok: false, error: first, status: 400 };
  }

  const {
    title,
    slug: slugInput,
    excerpt,
    content,
    imageUrl,
    galleryUrls,
    notifyPush,
  } = parsed.data;

  if (isEffectivelyEmptyHtml(content)) {
    return {
      ok: false,
      error: "El cuerpo de la noticia no puede estar vacío",
      status: 400,
    };
  }

  let sanitized: string;
  try {
    sanitized = sanitizeNewsContent(content);
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "No se pudo validar el HTML de la noticia.",
      status: 400,
    };
  }

  if (isEffectivelyEmptyHtml(sanitized)) {
    return {
      ok: false,
      error: "El contenido no tiene texto permitido tras la validación.",
      status: 400,
    };
  }

  const baseSlug = slugifyTitle(slugInput?.trim() || title);
  let finalSlug: string;
  try {
    finalSlug = await resolveUniqueNewsSlug(baseSlug);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error de slug",
      status: 500,
    };
  }

  const cover =
    imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== ""
      ? imageUrl.trim()
      : null;
  const gallery = (galleryUrls ?? []).filter(Boolean);
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
        authorId,
        createdAt: now,
        updatedAt: now,
      })
      .select("slug")
      .single();

    if (error) {
      const detail = [error.message, error.hint, (error as { details?: string }).details]
        .filter(Boolean)
        .join(" — ");
      console.error("[publishNewsArticle]", error);
      return {
        ok: false,
        error: detail || "No se pudo guardar la noticia",
        code: (error as { code?: string }).code,
        status: 500,
      };
    }

    if (!row?.slug) {
      return { ok: false, error: "La noticia no devolvió slug.", status: 500 };
    }

    try {
      revalidatePath("/");
      revalidatePath("/noticias");
      revalidatePath(`/noticias/${row.slug}`);
    } catch (revErr) {
      /** La noticia ya está guardada; no fallar el publish si la caché no revalida en este runtime. */
      console.error("[publishNewsArticle] revalidatePath", revErr);
    }

    if (notifyPush) {
      void broadcastNewsPublishedPush({
        title: title.trim(),
        slug: row.slug,
        excerpt: excerpt?.trim() ? excerpt.trim() : null,
      }).catch((pushErr) => {
        console.error("[publishNewsArticle] push notify", pushErr);
      });
    }

    return { ok: true, slug: row.slug };
  } catch (e) {
    console.error("[publishNewsArticle] unexpected", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error interno al publicar",
      status: 500,
    };
  }
}
