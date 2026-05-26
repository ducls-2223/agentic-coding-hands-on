import Image from "next/image";
import Link from "next/link";

const KUDOS_DESC = `ĐIỂM MỚI CỦA SAA 2025
Hoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên được diễn ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng 11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm ơn đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu để Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt giải.`;

/**
 * Sun* Kudos promotional banner, awards-page variant.
 * Uses /awards/kudos-bg.png and /awards/kudos-logo.svg instead of the
 * homepage variants.
 */
export function AwardsKudosBanner() {
  return (
    <section className="w-full bg-[#0A0E1B] py-24">
      <div className="mx-auto max-w-[1512px] px-[144px]">
        <div
          className="relative w-full max-w-[1224px] mx-auto overflow-hidden rounded-2xl"
          style={{ height: 500 }}
        >
          {/* Background image */}
          <Image
            src="/awards/kudos-bg.png"
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1440px) 100vw, 1224px"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#0F0F0F]/60 rounded-2xl" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center px-16">
            {/* Left: text content */}
            <div className="flex flex-col gap-8 max-w-[457px]">
              <div className="flex flex-col gap-4">
                <p className="font-montserrat text-2xl font-bold leading-8 text-white">
                  Phong trào ghi nhận
                </p>
                <h2 className="font-montserrat text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-[#FFEA9E]">
                  Sun* Kudos
                </h2>
                <p className="font-montserrat text-base font-bold leading-6 tracking-[0.5px] text-white text-justify whitespace-pre-line">
                  {KUDOS_DESC}
                </p>
              </div>

              <Link
                href="/sun-kudos"
                className="flex w-fit items-center gap-2 rounded bg-[#FFEA9E] px-4 py-4 font-montserrat text-base font-bold text-[#00101A] hover:bg-[#f5de8a] transition-colors"
              >
                Chi tiết
                <Image
                  src="/home/icon-arrow-right.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </Link>
            </div>

            {/* Right: Kudos logo */}
            <div className="absolute right-16 bottom-16">
              <Image
                src="/awards/kudos-logo.svg"
                alt="Sun* Kudos"
                width={364}
                height={72}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
