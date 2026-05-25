"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server action invoked by the form on /login. Asks Supabase for a Google
 * OAuth authorize URL, then redirects the browser to it. The provider
 * sends the user back to /auth/callback with `?code=…` once consent is
 * granted (see app/auth/callback/route.ts).
 */
export async function loginWithGoogle() {
  const origin = await resolveOrigin();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data?.url) {
    redirect("/login?error=oauth_init_failed");
  }

  // redirect() throws NEXT_REDIRECT — let it propagate, do not wrap.
  redirect(data.url);
}

/**
 * Resolve the absolute origin used to build the OAuth `redirectTo`.
 *
 * Prefers `SITE_URL` from env so deployments cannot be tricked into pointing
 * Supabase at an attacker domain via spoofed `x-forwarded-host` (the dev
 * server falls back to the request `host`, which is safe locally).
 */
async function resolveOrigin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL;

  const host = (await headers()).get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.")
    ? "http"
    : "https";
  return `${proto}://${host}`;
}
