import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

/**
 * Auth gating + session-cookie refresh for the Next.js 16 Proxy
 * (formerly Middleware).
 *
 * - Refreshes Supabase session cookies on every request.
 * - Unauthenticated users hitting protected routes → redirect to /login.
 * - Authenticated users on /login → redirect to /.
 *
 * The matcher in `proxy.ts` excludes `_next/*`, static assets, and
 * `/auth/callback` (the callback must run before the gate sees the session).
 */
export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: do not run any code between createServerClient and getUser —
  // it must be the first auth call so the session cookie refresh completes.
  // Fail closed on network errors: if Supabase is unreachable we treat the
  // caller as unauthenticated rather than 500-ing the whole app.
  let user = null;
  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    user = null;
  }

  const pathname = request.nextUrl.pathname;
  const isLoginRoute = pathname === "/login";

  if (!user && !isLoginRoute) {
    return buildRedirect(response, request, "/login");
  }

  if (user && isLoginRoute) {
    return buildRedirect(response, request, "/");
  }

  return response;
}

/**
 * Build a redirect response that carries any cookies set on the original
 * response. Without this, a session-cookie refresh that happens inside the
 * same proxy invocation as a redirect is silently dropped.
 */
function buildRedirect(
  baseResponse: NextResponse,
  request: NextRequest,
  pathname: string,
): NextResponse {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";

  const redirect = NextResponse.redirect(redirectUrl);
  for (const cookie of baseResponse.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}
