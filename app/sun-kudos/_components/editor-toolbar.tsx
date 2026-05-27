"use client";

import Image from "next/image";
import { useTranslation } from "@/app/_components/use-translation";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

interface ToolbarButton {
  src: string;
  labelKey: TranslationKey;
}

const BUTTONS: ToolbarButton[] = [
  { src: "/kudos/editor/bold.svg", labelKey: "kudos.editor.bold" },
  { src: "/kudos/editor/italic.svg", labelKey: "kudos.editor.italic" },
  { src: "/kudos/editor/strikethrough.svg", labelKey: "kudos.editor.strikethrough" },
  { src: "/kudos/editor/number-list.svg", labelKey: "kudos.editor.numbered_list" },
  { src: "/kudos/editor/link.svg", labelKey: "kudos.editor.link" },
  { src: "/kudos/editor/quote.svg", labelKey: "kudos.editor.quote" },
];

/**
 * Visual-only formatting strip. Buttons are decorative — clicks do nothing.
 * Functional rich-text editing is out of scope for this iteration.
 */
export function EditorToolbar() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between border-b border-[#998C5F]/30 px-3 py-2">
      <div className="flex items-center gap-1">
        {BUTTONS.map((btn) => (
          <button
            key={btn.labelKey}
            type="button"
            aria-label={t(btn.labelKey)}
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
        {t("kudos.editor.community_guidelines")}
      </button>
    </div>
  );
}
