"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/app/_components/use-translation";
import { DEPARTMENTS, type Department } from "../_data/departments";

interface DepartmentFilterProps {
  /** Currently selected department, or null when no filter is applied. */
  value: Department | null;
  onChange: (next: Department | null) => void;
}

export function DepartmentFilter({ value, onChange }: DepartmentFilterProps) {
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

  // Button face: short noun "Phòng ban" / "Department" — distinct from
  // `filter_department_label` (ARIA label, "Filter by department") and
  // `filter_open` (button aria-label).
  const label = value ?? t("sun_kudos.filter_department");

  function handlePick(next: Department | null) {
    setOpen(false);
    if (next === value) return;
    onChange(next);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("sun_kudos.filter_open")}
        className="font-montserrat flex items-center gap-2 rounded-full border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[rgba(255,234,158,0.18)]"
      >
        {label}
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
          aria-label={t("sun_kudos.filter_department_label")}
          className="absolute right-0 top-full z-50 mt-2 max-h-[348px] w-[200px] overflow-y-auto rounded-xl border border-[#998C5F] bg-[#00101A] py-2 shadow-2xl"
        >
          <li role="option" aria-selected={value === null}>
            <button
              type="button"
              onClick={() => handlePick(null)}
              className={`font-montserrat block w-full px-5 py-2.5 text-left text-sm font-bold transition-colors ${
                value === null
                  ? "bg-[rgba(255,234,158,0.18)] text-[#FFEA9E]"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {t("sun_kudos.filter_department_all")}
            </button>
          </li>
          {DEPARTMENTS.map((dept) => {
            const isSelected = dept === value;
            return (
              <li key={dept} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handlePick(dept)}
                  className={`font-montserrat block w-full px-5 py-2.5 text-left text-sm font-bold transition-colors ${
                    isSelected
                      ? "bg-[rgba(255,234,158,0.18)] text-[#FFEA9E]"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {dept}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
