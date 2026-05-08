import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Uses the publishable key — safe in the browser
 * because Row Level Security gates all writes server-side.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
