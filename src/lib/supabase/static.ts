import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cookie-less anon client for public catalogue reads. Because it never touches
 * request cookies it can be used inside `unstable_cache`, letting public data
 * be served from the server cache instead of hitting Supabase on every request.
 * RLS still applies — this client only ever sees public rows.
 */
export function createStaticClient(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return client;
}
