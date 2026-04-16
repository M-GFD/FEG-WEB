"use server";

import { redirect } from "next/navigation";
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
};

export async function publishNewsFromGestion(
  input: PublishNewsFormInput
): Promise<PublishNewsArticleResult> {
  const session = await auth();
  if (!session?.user || !canModeratePress(session.user.role)) {
    return { ok: false, error: "No autorizado", status: 401 };
  }

  let result: PublishNewsArticleResult;
  try {
    result = await publishNewsArticle(session.user.id, {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      imageUrl: input.imageUrl,
      galleryUrls: input.galleryUrls,
    });
  } catch (e) {
    console.error("[publishNewsFromGestion] fatal", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error interno del servidor",
      status: 500,
    };
  }

  if (result.ok) {
    redirect(`/noticias/${result.slug}`);
  }
  return result;
}
