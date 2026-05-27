import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

/**
 * Section header: small caption + divider + large yellow heading.
 * Mirrors the mms_A_Title hệ thống giải thưởng Figma frame.
 */
export async function AwardsTitle() {
  const lang = await getLanguage();
  return (
    <div className="mx-auto w-full max-w-[1440px] px-[144px]">
      <div className="flex flex-col gap-4">
        {/* Caption */}
        <p className="font-montserrat text-center text-2xl font-bold leading-8 text-white">
          {t(lang, "awards.subtitle")}
        </p>

        {/* Divider */}
        <div className="h-px w-full bg-[#2E3940]" />

        {/* Big yellow heading */}
        <div className="flex items-center justify-center">
          <h1 className="font-montserrat text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-[#FFEA9E]">
            {t(lang, "awards.title_full")}
          </h1>
        </div>
      </div>
    </div>
  );
}
