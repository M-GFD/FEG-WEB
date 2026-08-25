"use server";

import { auth } from "@/lib/auth";
import { canModeratePress } from "@/lib/rbac";
import {
  publishNewsArticle,
  updateNewsArticle,
  type PublishNewsArticleResult,
} from "@/lib/publish-news";
import { createNewsVideoSignedUpload } from "@/lib/news-storage";
import { z } from "zod";

export type PublishNewsFormInput = {
  title: string;
  slug?: string;
  excerpt: string | null;
  content: string;
  imageUrl: string;
  galleryUrls: string[];
  audience?: "GENERAL" | "MENORES" | "MAYORES";
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
      audience: input.audience ?? "GENERAL",
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

export async function updateNewsFromGestion(
  newsId: string,
  input: PublishNewsFormInput
): Promise<PublishNewsArticleResult> {
  try {
    const session = await auth();
    if (!session?.user || !canModeratePress(session.user.role)) {
      return { ok: false, error: "No autorizado", status: 401 };
    }

    return await updateNewsArticle(newsId, {
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      imageUrl: input.imageUrl,
      galleryUrls: input.galleryUrls,
      audience: input.audience ?? "GENERAL",
      notifyPush: Boolean(input.notifyPush),
    });
  } catch (e) {
    console.error("[updateNewsFromGestion]", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error interno del servidor",
      status: 500,
    };
  }
}

const prepareVideoSchema = z.object({
  mimeType: z.enum(["video/mp4", "video/webm"]),
  fileSize: z.number().int().positive(),
});

/** Credenciales para subir MP4/WebM directo a Storage, sin pasar por Vercel. */
export async function prepareNewsVideoUpload(input: {
  mimeType: string;
  fileSize: number;
}) {
  const session = await auth();
  if (!session?.user || !canModeratePress(session.user.role)) {
    return { ok: false as const, error: "No autorizado" };
  }
  if (!session.user.id) {
    return { ok: false as const, error: "Sesión inválida" };
  }

  const parsed = prepareVideoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.errors[0]?.message ?? "Datos del archivo inválidos",
    };
  }

  return createNewsVideoSignedUpload(
    session.user.id,
    parsed.data.mimeType,
    parsed.data.fileSize
  );
}
