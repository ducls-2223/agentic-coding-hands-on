import Image from "next/image";
import { LocalizedLink as Link } from "./localized-link";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

import { ArrowUpRightIcon } from "./arrow-up-right-icon";

export interface AwardCardData {
  slug: string;
  title: string;
  desc: string;
  /** PNG with the metallic-gold award title text (no background). */
  image: string;
}

export async function AwardCard({ slug, title, desc, image }: AwardCardData) {
  const lang = await getLanguage();
  return (
    <div className="flex flex-col gap-4">
      {/* Thumbnail: shared glowing orb background with the per-award title
          PNG layered on top. The two-layer composition matches the Figma
          design where every card uses the same circular halo orb under a
          different title image. */}
      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-[#0A0E1B]">
        <Image
          src="/home/awards/orb-bg.png"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain p-12"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-3">
        <h3 className="font-montserrat text-xl font-bold leading-7 text-[#FFEA9E]">
          {title}
        </h3>
        <p className="font-montserrat text-base font-bold leading-6 text-white line-clamp-2">
          {desc}
        </p>
        <Link
          href={`/awards-information#${slug}`}
          className="flex items-center gap-2 font-montserrat text-base font-bold text-[#FFEA9E] hover:underline transition-colors"
        >
          {t(lang, "common.view_details")}

          <ArrowUpRightIcon />
        </Link>
      </div>
    </div>
  );
}
