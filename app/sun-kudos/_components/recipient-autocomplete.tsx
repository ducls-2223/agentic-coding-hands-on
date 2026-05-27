"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/app/_components/use-translation";

interface RecipientOption {
  name: string;
  level: string;
}

// Static list derived from seed Sunner names in _data/kudos-mock.ts.
// Used for visual-only autocomplete — selections are not persisted.
const SUNNERS: RecipientOption[] = [
  { name: "Nguyễn Bá Chức", level: "CEVC10" },
  { name: "Đỗ Hoàng Hiệp", level: "CEVC8" },
  { name: "Dương Thúy An", level: "CEVC7" },
  { name: "Mai Phương Thúy", level: "CEVC9" },
  { name: "Lê Kiều Trang", level: "CEVC6" },
  { name: "Nguyễn Hoàng Linh", level: "CEVC8" },
  { name: "Nguyễn Văn Quy", level: "CEVC5" },
];

interface RecipientAutocompleteProps {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
  inputId?: string;
}

export function RecipientAutocomplete({
  value,
  onChange,
  disabled,
  inputId,
}: RecipientAutocompleteProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
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

  const filtered = value
    ? SUNNERS.filter((s) =>
        s.name.toLowerCase().includes(value.toLowerCase()),
      )
    : SUNNERS;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder={t("kudos.dialog.recipient_placeholder")}
          className="font-montserrat h-14 w-full rounded-lg border border-[#998C5F] bg-white px-4 pr-12 text-base text-[#00101A] placeholder:text-[#998C5F] focus:border-[#00101A] focus:outline-none disabled:opacity-60"
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

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-[#998C5F] bg-white py-1 shadow-lg"
        >
          {filtered.map((option) => (
            <li key={option.name}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.name);
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
