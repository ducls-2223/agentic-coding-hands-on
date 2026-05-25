import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth callback. Supabase redirects the browser here with `?code=...` after
 * Google sign-in. Exchange the code for a session (cookies set via the
 * server client), then redirect to `/`.
 *
 * On failure → /login?error=oauth_exchange_failed.
 * Missing code → /login?error=oauth_missing_code.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_missing_code", origin),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_exchange_failed", origin),
    );
  }

  return NextResponse.redirect(new URL("/", origin));
}
