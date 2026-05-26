"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server action invoked by the user-menu Sign-out item.
 * Terminates the Supabase session (clears auth cookies) then bounces to /login.
 */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  // redirect() throws NEXT_REDIRECT — let it propagate, do not wrap.
  redirect("/login");
}
