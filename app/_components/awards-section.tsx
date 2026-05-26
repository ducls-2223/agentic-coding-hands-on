import { AwardCard, type AwardCardData } from "./award-card";

const AWARDS: AwardCardData[] = [
  {
    slug: "top-talent",
    title: "Top Talent",
    desc: "Vinh danh top cá nhân xuất sắc trên mọi phương diện",
    image: "/home/awards/top-talent.png",
  },
  {
    slug: "top-project",
    title: "Top Project",
    desc: "Vinh danh dự án xuất sắc của năm",
    image: "/home/awards/top-project.png",
  },
  {
    slug: "top-project-leader",
    title: "Top Project Leader",
    desc: "Vinh danh người dẫn dắt dự án xuất sắc",
    image: "/home/awards/top-project-leader.png",
  },
  {
    slug: "best-manager",
    title: "Best Manager",
    desc: "Vinh danh người quản lý xuất sắc nhất",
    image: "/home/awards/best-manager.png",
  },
  {
    slug: "signature-creator",
    title: "Signature 2025 - Creator",
    desc: "Vinh danh người tạo dấu ấn của năm",
    image: "/home/awards/signature-creator.png",
  },
  {
    slug: "mvp",
    title: "MVP (Most Valuable Person)",
    desc: "Vinh danh nhân vật có giá trị nhất",
    image: "/home/awards/mvp.png",
  },
];

export function AwardsSection() {
  return (
    <section className="w-full bg-[#0A0E1B] py-[96px]">
      <div className="mx-auto max-w-[1512px] px-[144px]">
        <div className="flex flex-col gap-20 max-w-[1224px]">
          {/* Section header */}
          <div className="flex flex-col gap-4">
            <p className="font-montserrat text-2xl font-bold leading-8 text-white">
              Sun* annual awards 2025
            </p>
            <div className="h-px w-full bg-[#2E3940]" />
            <h2 className="font-montserrat text-[57px] font-bold leading-16 tracking-[-0.25px] text-[#FFEA9E]">
              Hệ thống giải thưởng
            </h2>
          </div>

          {/* 6-card grid: 3 cols desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
            {AWARDS.map((award) => (
              <AwardCard key={award.slug} {...award} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
