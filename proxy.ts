import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 Proxy (formerly Middleware). Runs before every matched request.
 * Refreshes the Supabase session cookie and gates routes.
 */
export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  // Run on every request EXCEPT:
  //   - Next.js internals (_next/*)
  //   - The OAuth callback route (must execute its own session exchange)
  //   - Static asset extensions
  //   - Common Next.js metadata files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif|woff|woff2|ttf|otf|css|js|map)$).*)",
  ],
};
