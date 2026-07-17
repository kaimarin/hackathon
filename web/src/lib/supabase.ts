import { createClient } from "@supabase/supabase-js";

// Server-only client using the secret key (bypasses RLS).
// Never import this from client components.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY env var"
    );
  }
  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}
