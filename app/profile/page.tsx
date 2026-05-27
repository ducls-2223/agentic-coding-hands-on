import { LocalizedLink as Link } from "@/app/_components/localized-link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

// Auth-gated by proxy.ts → reads cookies → cannot be statically prerendered.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? "User";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E1B] px-6 text-center text-white">
      <h1 className="font-montserrat text-3xl font-bold md:text-5xl">
        Profile
      </h1>
      <p className="mt-4 text-base text-white/70 md:text-lg">
        Signed in as <span className="text-[#FFEA9E]">{displayName}</span>
      </p>
      <p className="mt-2 max-w-md text-sm text-white/60">
        Coming soon. Profile management for SAA 2025 will live here.
      </p>
      <Link
        href="/"
        className="font-montserrat mt-8 inline-flex items-center rounded-lg bg-[#FFEA9E] px-6 py-3 font-bold text-[#00101A] transition-colors hover:brightness-95"
      >
        ← Back to home
      </Link>
    </main>
  );
}
