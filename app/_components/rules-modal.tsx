"use client";

import Image from "next/image";
import { useEffect } from "react";

interface RulesModalProps {
  onClose: () => void;
  onWriteKudos: () => void;
}

interface HeroTier {
  src: string;
  alt: string;
  range: string;
  description: string;
}

interface BadgeIcon {
  src: string;
  name: string;
}

const HERO_TIERS: HeroTier[] = [
  {
    src: "/rules/hero-new.png",
    alt: "New Hero",
    range: "Có 1-4 người gửi Kudos cho bạn",
    description:
      "Hành trình lan tỏa điều tốt đẹp bắt đầu – những lời cảm ơn và ghi nhận đầu tiên đã tìm đến bạn.",
  },
  {
    src: "/rules/hero-rising.png",
    alt: "Rising Hero",
    range: "Có 5-9 người gửi Kudos cho bạn",
    description:
      "Hình ảnh bạn đang lớn dần trong trái tim đồng đội bằng sự tử tế và cống hiến của mình.",
  },
  {
    src: "/rules/hero-super.png",
    alt: "Super Hero",
    range: "Có 10–20 người gửi Kudos cho bạn",
    description:
      "Bạn đã trở thành biểu tượng được tin tưởng và yêu quý, người luôn sẵn sàng hỗ trợ và được nhiều đồng đội nhớ đến.",
  },
  {
    src: "/rules/hero-legend.png",
    alt: "Legend Hero",
    range: "Có hơn 20 người gửi Kudos cho bạn",
    description:
      "Bạn đã trở thành huyền thoại – người để lại dấu ấn khó quên trong tập thể bằng trái tim và hành động của mình.",
  },
];

const SECRET_BOX_BADGES: BadgeIcon[] = [
  { src: "/rules/badge-revival.png", name: "REVIVAL" },
  { src: "/rules/badge-touch-of-light.png", name: "TOUCH OF LIGHT" },
  { src: "/rules/badge-stay-gold.png", name: "STAY GOLD" },
  { src: "/rules/badge-flow-to-horizon.png", name: "FLOW TO HORIZON" },
  { src: "/rules/badge-beyond-the-boundary.png", name: "BEYOND THE BOUNDARY" },
  { src: "/rules/badge-root-further.png", name: "ROOT FURTHER" },
];

export function RulesModal({ onClose, onWriteKudos }: RulesModalProps) {
  // Lock background scroll while the modal is open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Thể lệ SAA 2025"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="font-montserrat relative z-10 flex h-full w-full max-w-[640px] flex-col bg-[#00070C] shadow-2xl">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-10 py-10">
          <h2 className="mb-6 text-3xl font-bold text-[#FFEA9E]">Thể lệ</h2>

          {/* SECTION 1: Người nhận */}
          <section className="mb-8">
            <h3 className="mb-3 text-base font-bold uppercase leading-6 tracking-wide text-white">
              Người nhận Kudos: Huy hiệu Hero cho những ảnh hưởng tích cực
            </h3>
            <p className="mb-5 text-sm leading-6 text-white/80">
              Dựa trên số lượng đồng đội gửi trao Kudos, bạn sẽ sở hữu Huy hiệu
              Hero tương ứng, được hiển thị trực tiếp cạnh tên profile
            </p>

            <ul className="space-y-4">
              {HERO_TIERS.map((tier) => (
                <li key={tier.alt}>
                  <div className="mb-1 flex items-center gap-3">
                    <Image
                      src={tier.src}
                      alt={tier.alt}
                      width={88}
                      height={24}
                      className="h-6 w-auto shrink-0"
                    />
                    <span className="text-sm font-bold text-white">
                      {tier.range}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-white/70">
                    {tier.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* SECTION 2: Người gửi */}
          <section className="mb-8">
            <h3 className="mb-3 text-base font-bold uppercase leading-6 tracking-wide text-white">
              Người gửi Kudos: Sưu tập trọn bộ 6 icon, nhận ngay phần quà bí ẩn
            </h3>
            <p className="mb-6 text-sm leading-6 text-white/80">
              Mỗi lời Kudos bạn gửi sẽ được đăng tải trên hệ thống và nhận về
              những lượt ❤️ từ cộng đồng Sunner. Cứ mỗi 5 lượt ❤️, bạn sẽ được
              mở 1 Secret Box, với cơ hội nhận về một trong 6 icon độc quyền của
              SAA.
            </p>

            <div className="mb-6 grid grid-cols-3 gap-x-4 gap-y-6">
              {SECRET_BOX_BADGES.map((badge) => (
                <div
                  key={badge.name}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <Image
                    src={badge.src}
                    alt={badge.name}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-full object-cover"
                  />
                  <span className="text-xs font-bold uppercase leading-4 text-white">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-sm leading-6 text-white/80">
              Những Sunner thu thập trọn bộ 6 icon sẽ nhận về một phần quà bí ẩn
              từ SAA 2025.
            </p>
          </section>

          {/* SECTION 3: Quốc Dân */}
          <section>
            <h3 className="mb-3 text-base font-bold uppercase leading-6 tracking-wide text-white">
              Kudos Quốc Dân
            </h3>
            <p className="text-sm leading-6 text-white/80">
              5 Kudos nhận về nhiều ❤️ nhất toàn Sun* sẽ chính thức trở thành
              Kudos Quốc Dân và được trao phần quà đặc biệt từ SAA 2025: Root
              Further.
            </p>
          </section>
        </div>

        {/* Footer — sticky bar with Đóng + Viết KUDOS */}
        <div className="flex items-center gap-3 border-t border-white/10 bg-[#00070C] px-10 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-[#998C5F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            <Image
              src="/widget/widget-close.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            Đóng
          </button>
          <button
            type="button"
            onClick={onWriteKudos}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFEA9E] px-6 py-3 text-sm font-bold text-[#00101A] transition-opacity hover:brightness-95"
          >
            <Image
              src="/widget/widget-pen.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            Viết KUDOS
          </button>
        </div>
      </div>
    </div>
  );
}
