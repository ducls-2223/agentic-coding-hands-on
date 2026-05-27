"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { KudosItem } from "../_data/kudos-mock";
import type { Department } from "../_data/departments";
import type { AvailableHashtag } from "../_data/hashtags";
import { KudosCard } from "./kudos-card";
import { DepartmentFilter } from "./department-filter";
import { HashtagFilter } from "./hashtag-filter";
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
  const [department, setDepartment] = useState<Department | null>(null);
  const [hashtags, setHashtags] = useState<AvailableHashtag[]>([]);

  // Combined filter: department (single) ∧ hashtag (any-of). Reset carousel
  // index when filters change so we never point past the end.
  const filteredItems = useMemo(() => {
    let out = items;
    if (department) {
      out = out.filter((item) => item.receiver.department === department);
    }
    if (hashtags.length > 0) {
      out = out.filter((item) =>
        item.hashtags.some((tag) =>
          (hashtags as readonly string[]).includes(tag),
        ),
      );
    }
    return out;
  }, [items, department, hashtags]);

  function handleDepartmentChange(next: Department | null) {
    setDepartment(next);
    setIndex(0);
  }

  function handleHashtagsChange(next: AvailableHashtag[]) {
    setHashtags(next);
    setIndex(0);
  }

  const safeIndex = Math.min(index, Math.max(0, filteredItems.length - 1));

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () =>
    setIndex((i) => Math.min(filteredItems.length - 1, i + 1));

  const hasMultiple = filteredItems.length > 1;

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
              <HashtagFilter
                value={hashtags}
                onChange={handleHashtagsChange}
              />
              <DepartmentFilter
                value={department}
                onChange={handleDepartmentChange}
              />
            </div>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
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
                    transform: `translateX(calc(-${safeIndex} * (100% - 288px) / ${filteredItems.length - 1}))`,
                  }
                : undefined
            }
          >
            {filteredItems.map((item, i) => (
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
            {safeIndex + 1}/{filteredItems.length}
          </span>

          <button
            type="button"
            onClick={next}
            disabled={safeIndex === filteredItems.length - 1}
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
