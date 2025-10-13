import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no arquivo .env.",
  );
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
export const isSupabaseConfigured = client !== null;
