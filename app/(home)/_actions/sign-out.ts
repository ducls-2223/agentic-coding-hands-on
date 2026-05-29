"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server action invoked by the user-menu Sign-out item.
 * Terminates the Supabase session (clears auth cookies) then bounces to /login.
 */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  // scope: "local" clears only this browser's session. The default ("global")
  // revokes the refresh token for every device, which is hostile if the user
  // is signed in on phone + desktop and only meant to log out of this tab.
  await supabase.auth.signOut({ scope: "local" });

  // redirect() throws NEXT_REDIRECT — let it propagate, do not wrap.
  redirect("/login");
}
