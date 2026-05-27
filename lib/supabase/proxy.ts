import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { resolveEventStartMs } from "@/lib/event-time";
import { DEFAULT_LANGUAGE, LANGUAGE_PARAM, isLanguage } from "@/lib/i18n";
import { getSupabaseEnv } from "./env";

const PRELAUNCH_PATH = "/prelaunch";

/**
 * Auth gating + session-cookie refresh for the Next.js 16 Proxy
 * (formerly Middleware).
 *
 * - Refreshes Supabase session cookies on every request.
 * - Pre-event: redirect every route to /prelaunch.
 * - Post-event: /prelaunch redirects to /; auth gate applies as normal.
 * - Unauthenticated users hitting protected routes → redirect to /login.
 * - Authenticated users on /login → redirect to /.
 *
 * The matcher in `proxy.ts` excludes `_next/*`, static assets, and
 * `/auth/callback` (the callback must run before the gate sees the session).
 */
export async function updateSupabaseSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const beforeEvent = Date.now() < resolveEventStartMs();
  const isPrelaunchRoute = pathname === PRELAUNCH_PATH;

  // Expose the current pathname + language to the root layout. Next does not
  // provide either in `headers()` by default — proxies must inject them.
  // - x-pathname lets the layout vary chrome (e.g. hide the FAB on /prelaunch).
  // - x-lang carries the URL `?lang=` value so server components can resolve
  //   the active language without prop-drilling searchParams.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const rawLang = request.nextUrl.searchParams.get(LANGUAGE_PARAM);
  requestHeaders.set("x-lang", isLanguage(rawLang) ? rawLang : DEFAULT_LANGUAGE);
  const requestInit = { request: { headers: requestHeaders } };

  // Pre-event gate: bypass auth entirely and force everyone to /prelaunch.
  if (beforeEvent) {
    if (isPrelaunchRoute) return NextResponse.next(requestInit);
    return NextResponse.redirect(
      buildRedirectUrl(request, PRELAUNCH_PATH),
    );
  }

  // Post-event: keep /prelaunch from lingering — kick visitors back home so
  // the auth gate below can then route them to /login if needed.
  if (isPrelaunchRoute) {
    return NextResponse.redirect(buildRedirectUrl(request, "/"));
  }

  let response = NextResponse.next(requestInit);
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
        // requestInit must stay in this closure: it carries x-pathname.
        // Extracting setAll to a standalone factory would silently drop it.
        response = NextResponse.next(requestInit);
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
  const redirect = NextResponse.redirect(buildRedirectUrl(request, pathname));
  for (const cookie of baseResponse.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

function buildRedirectUrl(request: NextRequest, pathname: string): URL {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  // Preserve the language choice across auth redirects (e.g. /?lang=en →
  // /login should land on /login?lang=en). Drop everything else to avoid
  // leaking error/state params across routes.
  const lang = url.searchParams.get(LANGUAGE_PARAM);
  url.search = "";
  if (lang && isLanguage(lang) && lang !== DEFAULT_LANGUAGE) {
    url.searchParams.set(LANGUAGE_PARAM, lang);
  }
  return url;
}
