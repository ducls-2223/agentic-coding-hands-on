import { createSupabaseServerClient } from "@/lib/supabase/server";

import { HomeHeader } from "./_components/home-header";
import { HeroSection } from "./_components/hero-section";
import { RootFurtherContent } from "./_components/root-further-content";
import { AwardsSection } from "./_components/awards-section";
import { SunKudosSection } from "./_components/sun-kudos-section";
import { HomeFooter } from "./_components/home-footer";

// Auth-gated by proxy.ts → reads cookies → cannot be statically prerendered.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen w-full bg-[#0A0E1B] flex flex-col">
      {/* Sticky header */}
      <HomeHeader user={user} />

      {/* Main content — padded top to clear fixed header */}
      <main className="flex-1 pt-20">
        <HeroSection />
        <RootFurtherContent />
        <AwardsSection />
        <SunKudosSection />
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
