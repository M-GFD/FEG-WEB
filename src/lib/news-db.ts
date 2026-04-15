import { getSupabaseAdmin } from "./supabase";

export async function resolveUniqueNewsSlug(base: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Base de datos no disponible");
  }

  const root = base.trim() || "noticia";
  for (let n = 0; n < 200; n++) {
    const candidate = n === 0 ? root : `${root}-${n}`;
    const { data } = await supabase
      .from("News")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  throw new Error("No se pudo generar un slug único");
}
