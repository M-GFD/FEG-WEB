"use server";

import { auth } from "@/lib/auth";
import { canModeratePress } from "@/lib/rbac";
import {
  publishNewsArticle,
  type PublishNewsArticleResult,
} from "@/lib/publish-news";

export type PublishNewsFormInput = {
  title: string;
  slug?: string;
  excerpt: string | null;
  content: string;
  imageUrl: string;
  galleryUrls: string[];
  /** Enviar notificación push a PWA suscriptores al publicar. */
  notifyPush?: boolean;
};

export async function publishNewsFromGestion(
  input: PublishNewsFormInput
): Promise<PublishNewsArticleResult> {
  try {
    const session = await auth();
    if (!session?.user || !canModeratePress(session.user.role)) {
      return { ok: false, error: "No autorizado", status: 401 };
    }
    const userId = session.user.id;
    if (!userId) {
      return { ok: false, error: "Sesión inválida.", status: 401 };
    }

    return await publishNewsArticle(userId, {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      imageUrl: input.imageUrl,
      galleryUrls: input.galleryUrls,
      notifyPush: Boolean(input.notifyPush),
    });
  } catch (e) {
    console.error("[publishNewsFromGestion]", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error interno del servidor",
      status: 500,
    };
  }
}
