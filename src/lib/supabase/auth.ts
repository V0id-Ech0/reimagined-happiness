import { createClient } from "./client";

/**
 * Returns the current user ID, signing in anonymously if no session exists.
 * Anonymous sessions persist in localStorage — same identity across refreshes
 * until the user clears storage or explicitly signs out.
 */
export async function getOrCreateUserId(): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) return session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("[phosphene] auth error", error.message);
    return null;
  }
  return data.user?.id ?? null;
}
