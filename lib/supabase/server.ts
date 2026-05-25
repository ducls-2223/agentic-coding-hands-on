import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

/**
 * Server-side Supabase client. Reads + writes Next.js cookies via the
 * `next/headers` API (async in Next.js 16). Use inside Server Components,
 * Server Actions and Route Handlers.
 */
export async function createSupabaseServerClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll may be called from a Server Component where mutating
          // cookies is not allowed. Safe to ignore — middleware refreshes
          // the session cookie on every request anyway.
        }
      },
    },
  });
}
