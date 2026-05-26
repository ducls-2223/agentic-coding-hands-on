import Image from "next/image";
import Link from "next/link";

export interface AwardCardData {
  slug: string;
  title: string;
  desc: string;
  image: string;
}

export function AwardCard({ slug, title, desc, image }: AwardCardData) {
  return (
    <div className="flex flex-col gap-4">
      {/* Thumbnail */}
      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-[#0A0E1B]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
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
          Chi tiết
          <Image
            src="/home/icon-arrow-right.svg"
            alt=""
            width={24}
            height={24}
          />
        </Link>
      </div>
    </div>
  );
}
