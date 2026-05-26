"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface AwardsMenuItem {
  slug: string;
  title: string;
}

interface AwardsMenuProps {
  items: AwardsMenuItem[];
}

/**
 * Sticky left navigation for the awards list.
 * - Initializes active state from `window.location.hash` so deep-links (`#mvp`)
 *   don't flash the wrong item before the IntersectionObserver settles.
 * - Suppresses observer updates during programmatic smooth-scroll, otherwise
 *   the active highlight flickers through every intermediate section.
 */
export function AwardsMenu({ items }: AwardsMenuProps) {
  const [activeSlug, setActiveSlug] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.slice(1);
      if (hash && items.some((it) => it.slug === hash)) return hash;
    }
    return items[0]?.slug ?? "";
  });

  const isScrollingRef = useRef(false);
  const scrollResetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((it) => document.getElementById(it.slug))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveSlug(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    return () => {
      if (scrollResetTimerRef.current !== null) {
        window.clearTimeout(scrollResetTimerRef.current);
      }
    };
  }, []);

  function handleClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    slug: string
  ) {
    e.preventDefault();
    const target = document.getElementById(slug);
    if (!target) return;

    isScrollingRef.current = true;
    if (scrollResetTimerRef.current !== null) {
      window.clearTimeout(scrollResetTimerRef.current);
    }
    scrollResetTimerRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      scrollResetTimerRef.current = null;
    }, 800);

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", `#${slug}`);
    setActiveSlug(slug);
  }

  return (
    <nav className="flex flex-col gap-4">
      {items.map((item) => {
        const active = activeSlug === item.slug;
        return (
          <a
            key={item.slug}
            href={`#${item.slug}`}
            onClick={(e) => handleClick(e, item.slug)}
            aria-current={active ? "true" : undefined}
            className={[
              "flex items-center gap-1 rounded px-4 py-4 font-montserrat text-sm font-bold leading-5 transition-colors",
              active
                ? "border-b border-[#FFEA9E] text-[#FFEA9E]"
                : "text-white hover:bg-white/10",
            ].join(" ")}
          >
            <Image
              src="/awards/menu-arrow.svg"
              alt=""
              width={16}
              height={16}
              className="shrink-0"
            />
            <span>{item.title}</span>
          </a>
        );
      })}
    </nav>
  );
}
