"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_PARAM,
  type Language,
} from "@/lib/i18n";
import { useTranslation } from "./use-translation";

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

const OPTIONS: LanguageOption[] = [
  { code: "vi", label: "VN", flag: "/flags/vn.svg" },
  { code: "en", label: "EN", flag: "/flags/gb.svg" },
];

interface LanguageSwitcherProps {
  /** Current language as resolved server-side from the URL `?lang=` param. */
  current: Language;
  /** Optional class to override container styling on light backgrounds. */
  className?: string;
}

export function LanguageSwitcher({ current, className }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  // Optimistic state so the button label flips instantly while the router
  // navigates. Sync to a fresh `current` prop during render (canonical
  // alternative to a useEffect) once the new URL takes effect.
  const [selected, setSelected] = useState<Language>(current);
  const [lastCurrent, setLastCurrent] = useState<Language>(current);
  if (current !== lastCurrent) {
    setLastCurrent(current);
    setSelected(current);
  }
  const [pending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const selectedOption =
    OPTIONS.find((o) => o.code === selected) ?? OPTIONS[0];

  function handlePick(code: Language) {
    setOpen(false);
    if (code === selected) return;
    setSelected(code);

    // Build the new URL: same pathname + same other params, but set/remove
    // `?lang=` according to the picked language. Default (vi) omits the param
    // so URLs stay clean.
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (code === DEFAULT_LANGUAGE) {
      params.delete(LANGUAGE_PARAM);
    } else {
      params.set(LANGUAGE_PARAM, code);
    }
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.push(url);
      // Force a fresh server render. router.push alone may serve a cached
      // RSC payload for the same pathname, leaving server-rendered text in
      // the prior language — only the reactive client Provider would flip.
      // router.refresh() invalidates the Router Cache so server components
      // re-read `x-lang` and translate with the new language.
      router.refresh();
    });
  }

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("language.current")}: ${selectedOption.label}`}
        className="flex h-14 w-[108px] items-center justify-between gap-1 rounded px-4 py-4 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
      >
        <span className="flex items-center gap-1.5">
          <Image
            src={selectedOption.flag}
            alt=""
            width={20}
            height={15}
            aria-hidden="true"
          />
          <span className="font-montserrat ml-1">{selectedOption.label}</span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language.select")}
          className="absolute right-0 top-full z-50 mt-2 w-[140px] overflow-hidden rounded-lg border border-white/10 bg-[#00101A] shadow-xl"
        >
          {OPTIONS.map((option) => {
            const isSelected = option.code === selected;
            return (
              <li key={option.code} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handlePick(option.code)}
                  className={`font-montserrat flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-white transition-colors ${
                    isSelected ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                >
                  <Image
                    src={option.flag}
                    alt=""
                    width={20}
                    height={15}
                    aria-hidden="true"
                  />
                  <span>{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
