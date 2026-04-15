import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { processClubPhotoSubmission } from "@/lib/club-photo-submit";

export const runtime = "nodejs";

/**
 * Subida de fotos de clubes vía multipart estándar (evita "Unexpected end of form" de Server Actions).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { ok: false, error: "No se pudo leer el formulario (archivos demasiado grandes o conexión cortada)." },
      { status: 400 }
    );
  }

  const result = await processClubPhotoSubmission(formData, {
    id: session.user.id,
    role: session.user.role,
  });

  if (result.ok) {
    revalidatePath("/gestion/club/fotos");
    revalidatePath("/gestion/prensa");
    return Response.json(result);
  }

  return Response.json(result, { status: 400 });
}
