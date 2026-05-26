import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HomeHeader } from "@/app/_components/home-header";
import { HomeFooter } from "@/app/_components/home-footer";

import { AwardsKeyvisual } from "./_components/awards-keyvisual";
import { AwardsTitle } from "./_components/awards-title";
import { AwardsLayout } from "./_components/awards-layout";
import { AwardsMenu } from "./_components/awards-menu";
import { AwardDetail } from "./_components/award-detail";
import { AwardsKudosBanner } from "./_components/awards-kudos-banner";

// Auth-gated by proxy.ts → reads cookies → cannot be statically prerendered.
export const dynamic = "force-dynamic";

const AWARDS = [
  {
    slug: "top-talent",
    title: "Top Talent",
    description:
      "Vinh danh top cá nhân xuất sắc trên mọi phương diện. Người đạt giải thể hiện sự đa dạng năng lực, khả năng giải quyết vấn đề và tinh thần học hỏi không ngừng.",
    count: 10,
    unit: "Đơn vị",
    valueText: "7.000.000 VNĐ",
    valueSuffix: "cho mỗi giải thưởng",
    image: "/awards/cards/top-talent-title.png",
  },
  {
    slug: "top-project",
    title: "Top Project",
    description:
      "Vinh danh dự án xuất sắc của năm — dấu ấn tập thể tạo nên giá trị nổi bật cho khách hàng và cho tổ chức.",
    count: 2,
    unit: "Tập thể",
    valueText: "15.000.000 VNĐ",
    valueSuffix: "cho mỗi giải thưởng",
    image: "/home/awards/top-project.png",
  },
  {
    slug: "top-project-leader",
    title: "Top Project Leader",
    description:
      "Vinh danh người dẫn dắt dự án xuất sắc — kết nối đội ngũ, tháo gỡ trở ngại và đưa dự án đến kết quả mạnh mẽ.",
    count: 3,
    unit: "Cá nhân",
    valueText: "7.000.000 VNĐ",
    valueSuffix: "cho mỗi giải thưởng",
    image: "/home/awards/top-project-leader.png",
  },
  {
    slug: "best-manager",
    title: "Best Manager",
    description:
      "Vinh danh người quản lý xuất sắc nhất — lãnh đạo bằng sự đồng cảm, định hướng rõ ràng và tạo môi trường để mỗi cá nhân phát triển.",
    count: 1,
    unit: "Cá nhân",
    valueText: "10.000.000 VNĐ",
    valueSuffix: "cho mỗi giải thưởng",
    image: "/home/awards/best-manager.png",
  },
  {
    slug: "signature-creator",
    title: "Signature 2025 - Creator",
    description:
      "Vinh danh người tạo dấu ấn của năm — góp phần định hình bản sắc và chiều sâu sáng tạo của Sun*.",
    count: 1,
    unit: null,
    valueText: "5.000.000 VNĐ (cá nhân) / 8.000.000 VNĐ (tập thể)",
    valueSuffix: "cho mỗi giải thưởng",
    image: "/home/awards/signature-creator.png",
  },
  {
    slug: "mvp",
    title: "MVP (Most Valuable Person)",
    description:
      "Vinh danh nhân vật có giá trị nhất — tinh hoa của tinh thần Root Further, tổng hòa của năng lực, ảnh hưởng và sự bền bỉ.",
    count: 1,
    unit: null,
    valueText: "15.000.000 VNĐ",
    valueSuffix: "cho giải thưởng",
    image: "/home/awards/mvp.png",
  },
] as const;

export default async function AwardsInformationPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const menuItems = AWARDS.map((a) => ({ slug: a.slug, title: a.title }));

  return (
    <div className="min-h-screen w-full bg-[#0A0E1B] flex flex-col">
      <HomeHeader user={user} activePath="/awards-information" />

      <main className="flex-1 pt-20">
        {/* 1. Keyvisual banner with the page title overlaid on the same artwork */}
        <AwardsKeyvisual>
          <AwardsTitle />
        </AwardsKeyvisual>

        {/* 2. Two-column layout: sticky menu + award list */}
        <div className="py-30">
          <AwardsLayout menu={<AwardsMenu items={menuItems} />}>
            <div>
              {AWARDS.map((award, index) => (
                <AwardDetail
                  key={award.slug}
                  slug={award.slug}
                  title={award.title}
                  description={award.description}
                  count={award.count}
                  unit={award.unit}
                  valueText={award.valueText}
                  valueSuffix={award.valueSuffix}
                  image={award.image}
                  imageRight={index % 2 === 1}
                />
              ))}
            </div>
          </AwardsLayout>
        </div>

        {/* 3. Sun* Kudos promo banner */}
        <AwardsKudosBanner />
      </main>

      <HomeFooter activePath="/awards-information" />
    </div>
  );
}
