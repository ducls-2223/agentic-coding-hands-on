"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/app/_components/use-translation";
import {
  AVAILABLE_HASHTAGS,
  MAX_HASHTAG_FILTERS,
  type AvailableHashtag,
} from "../_data/hashtags";

interface HashtagFilterProps {
  /** Currently-selected hashtags. Empty array = no filter applied. */
  value: AvailableHashtag[];
  onChange: (next: AvailableHashtag[]) => void;
}

/**
 * Multi-select hashtag filter for the highlight carousel. Up to
 * `MAX_HASHTAG_FILTERS` (5) selections — matches the Figma "Tối đa 5"
 * design. Selected rows render a check icon; unselected rows beyond the
 * cap are visually disabled.
 */
export function HashtagFilter({ value, onChange }: HashtagFilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const atMax = value.length >= MAX_HASHTAG_FILTERS;

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function toggle(tag: AvailableHashtag) {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
      return;
    }
    if (atMax) return;
    onChange([...value, tag]);
  }

  // Button label: just the noun "Hashtag" — matches the existing dialog button
  // key. Selected count appears as a small badge beneath via the "max" caption.
  const buttonLabel = t("kudos.dialog.hashtag_button");

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("sun_kudos.filter_hashtag_open")}
        className="font-montserrat flex items-center gap-2 rounded-full border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[rgba(255,234,158,0.18)]"
      >
        {value.length > 0 ? `${buttonLabel} (${value.length})` : buttonLabel}
        <Image
          src="/login/chevron-down.svg"
          alt=""
          width={16}
          height={16}
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-label={t("sun_kudos.filter_hashtag_label")}
          className="absolute right-0 top-full z-50 mt-2 max-h-[348px] w-[260px] overflow-y-auto rounded-xl border border-[#998C5F] bg-[#00101A] py-2 shadow-2xl"
        >
          <li className="px-5 py-1.5 text-xs font-medium text-[#998C5F]">
            {t("sun_kudos.filter_hashtag_max", { n: MAX_HASHTAG_FILTERS })}
          </li>
          {AVAILABLE_HASHTAGS.map((tag) => {
            const isSelected = value.includes(tag);
            const disabled = !isSelected && atMax;
            return (
              <li
                key={tag}
                role="option"
                aria-selected={isSelected}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                  if (!disabled) toggle(tag);
                }}
                onKeyDown={(e) => {
                  if (disabled) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(tag);
                  }
                }}
                className={`font-montserrat flex items-center justify-between gap-2 px-5 py-2.5 text-left text-sm font-bold transition-colors ${
                  isSelected
                    ? "bg-[rgba(255,234,158,0.18)] text-[#FFEA9E]"
                    : disabled
                      ? "cursor-not-allowed text-white/40"
                      : "cursor-pointer text-white hover:bg-white/10"
                }`}
              >
                <span>{tag}</span>
                {isSelected && (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" fill="#FFEA9E" />
                    <path
                      d="M8 12.5L11 15.5L16.5 9"
                      stroke="#00101A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
