"use client";

import Image from "next/image";
import { KudosItem } from "../_data/kudos-mock";
import { KudosActionBar } from "./kudos-action-bar";
import { useTranslation } from "@/app/_components/use-translation";

interface KudosCardProps {
  item: KudosItem;
  variant?: "highlight" | "feed";
}

export function KudosCard({ item, variant = "feed" }: KudosCardProps) {
  const { t } = useTranslation();
  return (
    <article
      className="flex flex-col gap-4 rounded-3xl p-10 pb-4"
      style={{ backgroundColor: "rgba(255, 248, 225, 1)" }}
    >
      <div className="flex items-center justify-between gap-6">
        <UserInfo
          name={item.sender.name}
          level={item.sender.level}
          badge={item.sender.badge}
          avatar={item.sender.avatar}
        />

        <div className="flex flex-col items-center justify-center py-4">
          <Image
            src="/kudos/sent-arrow.svg"
            alt={t("sun_kudos.card.sent_to")}
            width={32}
            height={32}
          />
        </div>

        <UserInfo
          name={item.receiver.name}
          level={item.receiver.level}
          badge={item.receiver.badge}
          avatar={item.receiver.avatar}
        />
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      <div className="flex flex-col gap-4">
        {/* Timestamp */}
        <p className="font-montserrat text-xs font-bold text-[#998C5F]">
          {item.timestamp}
        </p>

        {/* Message */}
        <p className="font-montserrat text-sm font-medium leading-6 text-[#00101A] line-clamp-5">
          {item.message}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2">
          {item.hashtags.map((tag) => (
            <span
              key={tag}
              className="font-montserrat rounded-full border border-[#998C5F] px-3 py-1 text-xs font-bold text-[#998C5F]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Gallery thumbnails (feed variant only) */}
        {variant === "feed" && item.images && item.images.length > 0 && (
          <div className="flex gap-2">
            {item.images.slice(0, 5).map((src, i) => (
              <div
                key={i}
                className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#FFEA9E]/30"
              >
                <Image
                  src={src}
                  alt={`${t("sun_kudos.card.gallery_image")} ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      <KudosActionBar
        kudosId={item.id}
        initialLikes={item.likes}
        showViewDetails={variant === "highlight"}
      />
    </article>
  );
}

// Sub-component for sender / receiver info
interface UserInfoProps {
  name: string;
  level: string;
  badge: string;
  avatar: string;
}

function UserInfo({ name, level, badge, avatar }: UserInfoProps) {
  return (
    <div className="flex flex-col items-center gap-3" style={{ width: "235px" }}>
      <div
        className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white"
      >
        <Image src={avatar} alt={name} fill sizes="64px" className="object-cover" />
      </div>
      {/* Name + level row */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-montserrat text-base font-bold leading-6 text-[#00101A] text-center">
          {name}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-montserrat text-xs font-bold text-[#999]">{level}</span>
          <span className="h-1 w-1 rounded-full bg-[#999] opacity-40" />
          <span
            className="rounded-full border border-[#FFEA9E]/80 px-2 py-px font-montserrat text-[10px] font-bold text-[#998C5F]"
          >
            {badge}
          </span>
        </div>
      </div>
    </div>
  );
}
