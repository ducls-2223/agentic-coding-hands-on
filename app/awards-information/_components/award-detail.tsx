import Image from "next/image";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

export interface AwardDetailProps {
  slug: string;
  title: string;
  description: string;
  count: number;
  unit: string | null;
  valueText: string;
  valueSuffix: string;
  /** Foreground title image (card-frame.png is always the bg) */
  image: string;
  /** When true, image appears on right and content on left */
  imageRight?: boolean;
}

/**
 * A single award detail section.
 * Layout: card image (336×336) paired with content block.
 * Alternates left/right per imageRight prop.
 * Each section ends with a 1px #2E3940 divider.
 */
export async function AwardDetail({
  slug,
  title,
  description,
  count,
  unit,
  valueText,
  valueSuffix,
  image,
  imageRight = false,
}: AwardDetailProps) {
  const lang = await getLanguage();
  const countDisplay = unit
    ? `${String(count).padStart(2, "0")} ${unit}`
    : String(count).padStart(2, "0");

  const cardBlock = (
    <div
      className="shrink-0 w-84 h-84 relative rounded-3xl overflow-hidden"
      style={{
        boxShadow: "0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287",
        border: "1px solid #FFEA9E",
      }}
    >
      {/* Background plate */}
      <Image
        src="/awards/cards/card-frame.png"
        alt=""
        fill
        className="object-cover"
        sizes="336px"
      />
      {/* Title image overlay centered */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <Image
          src={image}
          alt={title}
          width={229}
          height={54}
          className="object-contain"
          sizes="229px"
        />
      </div>
    </div>
  );

  const contentBlock = (
    <div className="flex flex-col gap-8 flex-1 min-w-0">
      {/* Title row */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Image
            src="/awards/menu-arrow.svg"
            alt=""
            width={24}
            height={24}
            className="shrink-0"
          />
          <h2 className="font-montserrat text-2xl font-bold leading-8 text-[#FFEA9E]">
            {title}
          </h2>
        </div>

        {/* Description */}
        <p className="font-montserrat text-base font-bold leading-6 tracking-[0.5px] text-white text-justify">
          {description}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#2E3940]" />

      {/* Count line */}
      <div className="flex items-center gap-4">
        <Image
          src="/awards/icon-count.svg"
          alt=""
          width={24}
          height={24}
          className="flex-shrink-0"
        />
        <span className="font-montserrat text-2xl font-bold leading-8 text-[#FFEA9E]">
          {t(lang, "awards.count_label")}
        </span>
        <span className="font-montserrat text-sm font-bold leading-5 tracking-[0.1px] text-white ml-auto">
          {countDisplay}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#2E3940]" />

      {/* Value section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Image
            src="/awards/icon-money.svg"
            alt=""
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="font-montserrat text-2xl font-bold leading-8 text-[#FFEA9E]">
            {t(lang, "awards.value_label")}
          </span>
        </div>
        <p className="font-montserrat text-[36px] font-bold leading-11 text-white">
          {valueText}
        </p>
        <p className="font-montserrat text-sm font-bold leading-5 tracking-[0.1px] text-white">
          {valueSuffix}
        </p>
      </div>
    </div>
  );

  return (
    <section id={slug} className="scroll-mt-24">
      <div className="pb-20">
        <div
          className={[
            "flex gap-10 items-start mb-20",
            imageRight ? "flex-row-reverse" : "flex-row",
          ].join(" ")}
        >
          {cardBlock}
          {contentBlock}
        </div>
        {/* Bottom border divider between sections */}
        <div className="h-px w-full bg-[#2E3940]" />
      </div>
    </section>
  );
}
