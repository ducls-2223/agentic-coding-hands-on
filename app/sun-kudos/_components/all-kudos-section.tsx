import { KudosItem, LeaderboardItem, UserStats } from "../_data/kudos-mock";
import { KudosCard } from "./kudos-card";
import { KudosSidebar } from "./kudos-sidebar";

interface AllKudosSectionProps {
  items: KudosItem[];
  stats: UserStats;
  rankups: LeaderboardItem[];
  gifts: LeaderboardItem[];
}

export function AllKudosSection({ items, stats, rankups, gifts }: AllKudosSectionProps) {
  return (
    <section className="flex w-full flex-col gap-10 py-16">
      <div className="px-[144px]">
        <div className="flex flex-col gap-4">
          <p className="font-montserrat text-2xl font-bold leading-8 text-white">
            Sun* Annual Awards 2025
          </p>
          <div className="h-px w-full bg-[#2E3940]" />
          <div className="flex items-center justify-between gap-8">
            <h2
              className="font-montserrat text-[57px] font-bold leading-[64px] text-[#FFEA9E]"
              style={{ letterSpacing: "-0.25px" }}
            >
              ALL KUDOS
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-20 px-[144px] lg:grid-cols-[1fr_422px]">
        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <KudosCard key={item.id} item={item} variant="feed" />
          ))}
        </div>

        <KudosSidebar stats={stats} rankups={rankups} gifts={gifts} />
      </div>
    </section>
  );
}
