"use client";

import Image from "next/image";

interface ToolbarButton {
  src: string;
  label: string;
}

const BUTTONS: ToolbarButton[] = [
  { src: "/kudos/editor/bold.svg", label: "In đậm" },
  { src: "/kudos/editor/italic.svg", label: "In nghiêng" },
  { src: "/kudos/editor/strikethrough.svg", label: "Gạch ngang" },
  { src: "/kudos/editor/number-list.svg", label: "Danh sách số" },
  { src: "/kudos/editor/link.svg", label: "Chèn liên kết" },
  { src: "/kudos/editor/quote.svg", label: "Trích dẫn" },
];

/**
 * Visual-only formatting strip. Buttons are decorative — clicks do nothing.
 * Functional rich-text editing is out of scope for this iteration.
 */
export function EditorToolbar() {
  return (
    <div className="flex items-center justify-between border-b border-[#998C5F]/30 px-3 py-2">
      <div className="flex items-center gap-1">
        {BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            aria-label={btn.label}
            className="flex h-8 w-8 items-center justify-center rounded text-[#998C5F] transition-colors hover:bg-[#FFEA9E]/40"
          >
            <Image
              src={btn.src}
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <button
        type="button"
        className="font-montserrat text-sm font-bold text-[#B72927] underline-offset-2 hover:underline"
      >
        Tiêu chuẩn cộng đồng
      </button>
    </div>
  );
}
