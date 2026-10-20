import { createClient } from "@supabase/supabase-js";

// Clé secrète (service_role) : réservée au serveur, jamais envoyée au front.
export function createSupabaseClient(env = process.env) {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = env;
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error("SUPABASE_URL et SUPABASE_SECRET_KEY sont requis : copier .env.example en .env et le remplir.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
  });
}
