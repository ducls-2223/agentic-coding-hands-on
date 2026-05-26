import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HomeHeader } from "@/app/_components/home-header";
import { HomeFooter } from "@/app/_components/home-footer";
import { KudosKeyvisual } from "./_components/kudos-keyvisual";
import { KudosInputBar } from "./_components/kudos-input-bar";
import { HighlightSection } from "./_components/highlight-section";
import { SpotlightBoard } from "./_components/spotlight-board";
import { AllKudosSection } from "./_components/all-kudos-section";
import {
  HIGHLIGHT_KUDOS,
  RANKUP_LIST,
  GIFT_LIST,
  USER_STATS,
} from "./_data/kudos-mock";
import { fetchAllKudos } from "./_lib/fetch-all-kudos";

export const dynamic = "force-dynamic";

export default async function SunKudosPage() {
  const supabase = await createSupabaseServerClient();
  const [
    {
      data: { user },
    },
    allKudos,
  ] = await Promise.all([supabase.auth.getUser(), fetchAllKudos()]);

  return (
    <div className="min-h-screen w-full bg-[#0A0E1B] flex flex-col">
      <HomeHeader user={user} activePath="/sun-kudos" />
      <main className="flex-1 pt-20">
        <KudosKeyvisual>
          <KudosInputBar />
        </KudosKeyvisual>
        <HighlightSection items={HIGHLIGHT_KUDOS} />
        <SpotlightBoard totalCount={388} />
        <AllKudosSection
          items={allKudos}
          stats={USER_STATS}
          rankups={RANKUP_LIST}
          gifts={GIFT_LIST}
        />
      </main>
      <HomeFooter activePath="/sun-kudos" />
    </div>
  );
}
