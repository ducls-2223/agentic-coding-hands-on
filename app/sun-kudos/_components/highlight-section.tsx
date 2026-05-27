"use client";

import Image from "next/image";
import { useState } from "react";
import { KudosItem } from "../_data/kudos-mock";
import { KudosCard } from "./kudos-card";
import { useTranslation } from "@/app/_components/use-translation";

interface HighlightSectionProps {
  items: KudosItem[];
}

/**
 * Highlight Kudos carousel.
 * - Index is clamped to [0, items.length-1].
 * - Empty / single-item lists render without the carousel math (the
 *   translate formula divides by `items.length - 1`, which is 0 in those
 *   cases).
 */
export function HighlightSection({ items }: HighlightSectionProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, Math.max(0, items.length - 1));

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(items.length - 1, i + 1));

  const hasMultiple = items.length > 1;

  return (
    <section className="flex w-full flex-col gap-10 pt-16">
      <div className="px-[144px]">
        <div className="flex flex-col gap-4">
          <p className="font-montserrat text-2xl font-bold leading-8 text-white">
            {t("sun_kudos.title_brand")}
          </p>
          <div className="h-px w-full bg-[#2E3940]" />
          <div className="flex items-center justify-between gap-8">
            <h2
              className="font-montserrat text-[57px] font-bold leading-[64px] text-[#FFEA9E]"
              style={{ letterSpacing: "-0.25px" }}
            >
              {t("sun_kudos.highlight_title")}
            </h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="font-montserrat flex items-center gap-2 rounded-full border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[rgba(255,234,158,0.18)]"
              >
                {t("kudos.dialog.hashtag_button")}
                <Image src="/login/chevron-down.svg" alt="" width={16} height={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="font-montserrat flex items-center gap-2 rounded-full border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[rgba(255,234,158,0.18)]"
              >
                {t("sun_kudos.filter_department")}
                <Image src="/login/chevron-down.svg" alt="" width={16} height={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-[144px]">
          <p className="font-montserrat py-12 text-center text-base text-white/70">
            {t("sun_kudos.empty")}
          </p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-[400px]"
            style={{
              background:
                "linear-gradient(90deg, #00101A 50%, rgba(255, 255, 255, 0.00) 100%)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-[400px]"
            style={{
              background:
                "linear-gradient(270deg, #00101A 50%, rgba(255, 255, 255, 0.00) 100%)",
            }}
            aria-hidden="true"
          />

          <div
            className="flex gap-6 px-[144px] transition-transform duration-300 ease-in-out"
            style={
              hasMultiple
                ? {
                    transform: `translateX(calc(-${safeIndex} * (100% - 288px) / ${items.length - 1}))`,
                  }
                : undefined
            }
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                className="w-[640px] flex-shrink-0 transition-opacity duration-300"
                style={{ opacity: i === safeIndex ? 1 : 0.35 }}
              >
                <KudosCard item={item} variant="highlight" />
              </div>
            ))}
          </div>
        </div>
      )}

      {hasMultiple && (
        <div className="flex items-center justify-center gap-8 pb-4">
          <button
            type="button"
            onClick={prev}
            disabled={safeIndex === 0}
            className="flex h-12 w-12 items-center justify-center rounded transition-opacity hover:bg-white/10 disabled:opacity-30"
            aria-label={t("sun_kudos.card.previous")}
          >
            <Image src="/kudos/arrow-prev.svg" alt="" width={28} height={28} aria-hidden="true" />
          </button>

          <span className="font-montserrat text-[28px] font-bold leading-9 text-[#999]">
            {safeIndex + 1}/{items.length}
          </span>

          <button
            type="button"
            onClick={next}
            disabled={safeIndex === items.length - 1}
            className="flex h-12 w-12 items-center justify-center rounded transition-opacity hover:bg-white/10 disabled:opacity-30"
            aria-label={t("sun_kudos.card.next")}
          >
            <Image src="/kudos/arrow-next.svg" alt="" width={28} height={28} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
