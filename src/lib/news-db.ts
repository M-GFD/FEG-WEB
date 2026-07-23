import { getSupabaseAdmin } from "./supabase";

/**
 * Genera un slug único. Si `excludeId` está definido (edición), permite
 * conservar el slug actual de esa noticia.
 */
export async function resolveUniqueNewsSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Base de datos no disponible");
  }

  const root = base.trim() || "noticia";
  for (let n = 0; n < 200; n++) {
    const candidate = n === 0 ? root : `${root}-${n}`;
    let q = supabase.from("News").select("id").eq("slug", candidate).limit(1);
    if (excludeId) {
      q = q.neq("id", excludeId);
    }
    const { data, error } = await q;
    if (error) {
      throw new Error(
        `Slug: ${error.message}${error.hint ? ` (${error.hint})` : ""}`
      );
    }
    if (!data?.length) return candidate;
  }
  throw new Error("No se pudo generar un slug único");
}
