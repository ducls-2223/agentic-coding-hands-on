import Image from "next/image";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

interface SpotlightBoardProps {
  totalCount: number;
}

// Static word-cloud name pool — positioned for visual hierarchy
const CLOUD_NAMES = [
  { name: "Nguyễn Bá Chức", size: "text-2xl", top: "8%", left: "5%", opacity: 1 },
  { name: "Đỗ Hoàng Hiệp", size: "text-lg", top: "18%", left: "32%", opacity: 0.85 },
  { name: "Dương Thúy An", size: "text-xl", top: "5%", left: "55%", opacity: 1 },
  { name: "Mai Phương Thúy", size: "text-base", top: "28%", left: "70%", opacity: 0.75 },
  { name: "Lê Kiều Trang", size: "text-2xl", top: "40%", left: "18%", opacity: 1 },
  { name: "Nguyễn Hoàng Linh", size: "text-sm", top: "12%", left: "78%", opacity: 0.65 },
  { name: "Nguyễn Văn Quy", size: "text-lg", top: "55%", left: "50%", opacity: 0.9 },
  { name: "Nguyễn Bá Chức", size: "text-sm", top: "62%", left: "5%", opacity: 0.55 },
  { name: "Dương Thúy An", size: "text-base", top: "70%", left: "75%", opacity: 0.7 },
  { name: "Mai Phương Thúy", size: "text-xl", top: "48%", left: "32%", opacity: 0.85 },
  { name: "Lê Kiều Trang", size: "text-sm", top: "75%", left: "25%", opacity: 0.6 },
  { name: "Đỗ Hoàng Hiệp", size: "text-2xl", top: "35%", left: "60%", opacity: 1 },
  { name: "Nguyễn Hoàng Linh", size: "text-base", top: "82%", left: "58%", opacity: 0.7 },
  { name: "Nguyễn Văn Quy", size: "text-sm", top: "22%", left: "48%", opacity: 0.6 },
  { name: "Nguyễn Bá Chức", size: "text-lg", top: "78%", left: "42%", opacity: 0.8 },
  { name: "Dương Thúy An", size: "text-sm", top: "55%", left: "88%", opacity: 0.55 },
  { name: "Lê Kiều Trang", size: "text-base", top: "30%", left: "4%", opacity: 0.75 },
  { name: "Mai Phương Thúy", size: "text-sm", top: "88%", left: "10%", opacity: 0.5 },
  { name: "Đỗ Hoàng Hiệp", size: "text-base", top: "68%", left: "14%", opacity: 0.7 },
  { name: "Nguyễn Hoàng Linh", size: "text-xl", top: "20%", left: "12%", opacity: 0.9 },
  { name: "Nguyễn Văn Quy", size: "text-lg", top: "45%", left: "80%", opacity: 0.8 },
  { name: "Nguyễn Bá Chức", size: "text-base", top: "85%", left: "80%", opacity: 0.65 },
  { name: "Dương Thúy An", size: "text-sm", top: "8%", left: "92%", opacity: 0.5 },
  { name: "Lê Kiều Trang", size: "text-lg", top: "60%", left: "65%", opacity: 0.8 },
  { name: "Mai Phương Thúy", size: "text-base", top: "92%", left: "48%", opacity: 0.6 },
  { name: "Đỗ Hoàng Hiệp", size: "text-sm", top: "50%", left: "10%", opacity: 0.55 },
  { name: "Nguyễn Văn Quy", size: "text-xl", top: "38%", left: "44%", opacity: 0.9 },
  { name: "Nguyễn Hoàng Linh", size: "text-sm", top: "73%", left: "38%", opacity: 0.6 },
];

export async function SpotlightBoard({ totalCount }: SpotlightBoardProps) {
  const lang = await getLanguage();
  return (
    <section className="w-full" style={{ backgroundColor: "rgba(0, 16, 26, 1)" }}>
      <div className="px-[144px] pt-16 pb-0">
        <div className="flex flex-col gap-4">
          <p className="font-montserrat text-2xl font-bold leading-8 text-white">
            {t(lang, "sun_kudos.title_brand")}
          </p>
          <div className="h-px w-full bg-[#2E3940]" />
          <div className="flex items-center gap-8">
            <h2
              className="font-montserrat text-[57px] font-bold leading-[64px] text-[#FFEA9E]"
              style={{ letterSpacing: "-0.25px" }}
            >
              {t(lang, "sun_kudos.spotlight_title")}
            </h2>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 mb-16" style={{ maxWidth: "1157px", margin: "32px auto 64px" }}>
        <div
          className="relative w-full overflow-hidden"
          style={{
            minHeight: "548px",
            border: "1px solid #998C5F",
            borderRadius: "47px",
          }}
        >
          {/* Total count chip */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2 rounded-full bg-[#FFEA9E] px-4 py-2">
            <span className="font-montserrat text-sm font-bold text-[#00101A]">
              {totalCount} KUDOS
            </span>
          </div>

          {/* Search bar top-right */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-3 rounded-full border border-[#998C5F] bg-[rgba(255,234,158,0.05)] px-4 py-2">
            <Image
              src="/kudos/search.svg"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            <span className="font-montserrat text-sm font-bold text-white/40">
              {t(lang, "common.search")}
            </span>
          </div>

          {/* Pan/zoom toggle (visual only) */}
          <div className="absolute bottom-6 right-6 z-10">
            <button
              type="button"
              className="font-montserrat rounded-full border border-[#998C5F] bg-[rgba(255,234,158,0.08)] px-4 py-2 text-xs font-bold text-[#998C5F] transition-colors hover:bg-[rgba(255,234,158,0.15)]"
              aria-label={t(lang, "sun_kudos.spotlight_pan_zoom")}
            >
              Pan / Zoom
            </button>
          </div>

          {/* Static name cloud */}
          <div className="absolute inset-0">
            {CLOUD_NAMES.map((entry, i) => (
              <span
                key={i}
                className={`font-montserrat absolute font-bold text-[#FFEA9E] select-none whitespace-nowrap ${entry.size}`}
                style={{
                  top: entry.top,
                  left: entry.left,
                  opacity: entry.opacity,
                  transform: "translateZ(0)",
                }}
              >
                {entry.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
