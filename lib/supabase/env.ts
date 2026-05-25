import "server-only";

export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase env vars: SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in .env.local",
    );
  }

  return { url, publishableKey };
}
