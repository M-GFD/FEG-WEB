import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Cliente Supabase con service role (bypass RLS).
 * Usa REST API por HTTPS - funciona aunque Postgres directo esté bloqueado.
 */
export function getSupabaseAdmin() {
  if (!url || !serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
