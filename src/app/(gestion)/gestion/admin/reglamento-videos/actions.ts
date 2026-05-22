"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  body: z.string().min(1, "La descripción es obligatoria").max(5000),
  videoUrl: z.string().url("URL de video inválida"),
  mimeType: z.enum(["video/mp4", "video/webm", "image/gif"]),
});

export async function createReglamentoVideo(input: {
  title: string;
  body: string;
  videoUrl: string;
  mimeType: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { ok: false as const, error: "No autorizado" };
  }

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false as const, error: "Base de datos no disponible" };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("ReglamentoVideo").insert({
    id: crypto.randomUUID(),
    title: parsed.data.title.trim(),
    body: parsed.data.body.trim(),
    videoUrl: parsed.data.videoUrl,
    mimeType: parsed.data.mimeType,
    published: true,
    authorId: session.user.id,
    createdAt: now,
    updatedAt: now,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/institucional/reglamento/videos");
  return { ok: true as const };
}
