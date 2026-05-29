"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";

import { useTranslation } from "@/app/_components/use-translation";
import { searchSunners } from "../_actions/search-sunners";
import type { Sunner } from "../_lib/fetch-sunners";

interface RecipientAutocompleteProps {
  /** Currently selected sunner id, or empty string when none. */
  value: string;
  /** Fires on selection — id is the sunner uuid, label is the display name. */
  onChange: (id: string, label: string) => void;
  /** Optional initial list to render before the first server fetch resolves. */
  initialOptions?: Sunner[];
  disabled?: boolean;
  inputId?: string;
  hasError?: boolean;
}

const DEBOUNCE_MS = 200;

export function RecipientAutocomplete({
  value,
  onChange,
  initialOptions = [],
  disabled,
  inputId,
  hasError,
}: RecipientAutocompleteProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Sunner[]>(initialOptions);
  const [, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Click-outside to close.
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

  // Debounced server-side filter on query change.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const next = await searchSunners(query);
        setOptions(next);
      });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Lazy-load on first focus if no initial options were provided.
  useEffect(() => {
    if (!open || options.length > 0) return;
    startTransition(async () => {
      const next = await searchSunners("");
      setOptions(next);
    });
  }, [open, options.length]);

  const borderColor = hasError ? "border-[#B72927]" : "border-[#998C5F]";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            // Clear the selection if the user is typing fresh — parent learns
            // via the empty id.
            if (value !== "") onChange("", "");
          }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder={t("kudos.dialog.recipient_placeholder")}
          aria-invalid={hasError || undefined}
          className={`font-montserrat h-14 w-full rounded-lg border ${borderColor} bg-white px-4 pr-12 text-base text-[#00101A] placeholder:text-[#998C5F] focus:border-[#00101A] focus:outline-none disabled:opacity-60`}
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={disabled}
          aria-label={t("kudos.dialog.recipient_open_list")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 disabled:opacity-50"
        >
          <Image
            src="/kudos/editor/chevron-down.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
        </button>
      </div>

      {open && options.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[#998C5F] bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.id, option.name);
                  setQuery(option.name);
                  setOpen(false);
                }}
                className="font-montserrat flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-[#00101A] hover:bg-[#FFF8E1]"
              >
                <span className="font-bold">{option.name}</span>
                <span className="text-xs text-[#998C5F]">{option.level}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
