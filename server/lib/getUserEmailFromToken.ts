import { getUserClient } from "./supabaseClients";

/**
 * Canonical downstream email resolver.
 * Uses JWT from req.user.token.
 * Does NOT mutate req.user.
 */
export async function getUserEmailFromToken(token: string): Promise<string> {
  if (!token) {
    throw new Error("Missing token for email resolution");
  }

  const supabase = getUserClient(token);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user?.email) {
    throw new Error("Unable to resolve user email from token");
  }

  return data.user.email;
}
