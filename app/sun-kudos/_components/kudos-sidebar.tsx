import Image from "next/image";
import { LeaderboardItem, UserStats } from "../_data/kudos-mock";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

interface KudosSidebarProps {
  stats: UserStats;
  rankups: LeaderboardItem[];
  gifts: LeaderboardItem[];
}

export async function KudosSidebar({ stats, rankups, gifts }: KudosSidebarProps) {
  const lang = await getLanguage();
  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[422px]">
      <div
        className="flex flex-col gap-4 rounded-[17px] border border-[#998C5F] p-6"
        style={{ backgroundColor: "#00070C" }}
      >
        <div className="flex flex-col gap-4">
          <StatRow label={t(lang, "sun_kudos.sidebar.received")} value={stats.received} />
          <StatRow label={t(lang, "sun_kudos.sidebar.sent")} value={stats.sent} />
          <StatRow label={t(lang, "sun_kudos.sidebar.hearts")} value={stats.hearts} />
          <div className="h-px w-full bg-[#2E3940]" />
          <StatRow label={t(lang, "sun_kudos.sidebar.secret_box_opened")} value={stats.secretBoxOpened} />
          <StatRow label={t(lang, "sun_kudos.sidebar.secret_box_unopened")} value={stats.secretBoxUnopened} />

          <button
            type="button"
            className="font-montserrat mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] py-4 text-[22px] font-bold text-[#00101A] transition-opacity hover:brightness-95"
          >
            {t(lang, "sun_kudos.sidebar.open_secret_box")}
            <Image
              src="/kudos/open-box.svg"
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div
        className="flex flex-col gap-4 rounded-[17px] border border-[#998C5F] p-6 pb-4"
        style={{ backgroundColor: "#00070C" }}
      >
        <h3 className="font-montserrat text-sm font-bold uppercase text-[#FFEA9E]">
          {t(lang, "sun_kudos.sidebar.rankups_title")}
        </h3>
        <div className="flex flex-col gap-3">
          {rankups.map((item) => (
            <LeaderboardRow key={`rankup-${item.rank}`} item={item} />
          ))}
        </div>
      </div>

      <div
        className="flex flex-col gap-4 rounded-[17px] border border-[#998C5F] p-6 pb-4"
        style={{ backgroundColor: "#00070C" }}
      >
        <h3 className="font-montserrat text-sm font-bold uppercase text-[#FFEA9E]">
          {t(lang, "sun_kudos.sidebar.gifts_title")}
        </h3>
        <div className="flex flex-col gap-3">
          {gifts.map((item) => (
            <LeaderboardRow key={`gift-${item.rank}`} item={item} />
          ))}
        </div>
      </div>
    </aside>
  );
}

// Stat row
interface StatRowProps {
  label: string;
  value: number;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-montserrat text-sm font-medium text-white/80">{label}</span>
      <span className="font-montserrat text-[32px] font-bold leading-10 text-[#FFEA9E]">
        {value}
      </span>
    </div>
  );
}

// Leaderboard row
interface LeaderboardRowProps {
  item: LeaderboardItem;
}

function LeaderboardRow({ item }: LeaderboardRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-montserrat w-5 text-center text-xs font-bold text-[#998C5F]">
        {item.rank}
      </span>
      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-[#998C5F]">
        <Image src={item.avatar} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="font-montserrat truncate text-sm font-bold text-white">
          {item.name}
        </span>
        <span className="font-montserrat truncate text-xs text-[#998C5F]">
          {item.note}
        </span>
      </div>
    </div>
  );
}
