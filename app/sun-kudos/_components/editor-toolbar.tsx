"use client";

import Image from "next/image";
import type { Editor } from "@tiptap/react";

import { useTranslation } from "@/app/_components/use-translation";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

interface ToolbarButtonSpec {
  src: string;
  labelKey: TranslationKey;
  /** Returns true when the current selection has the mark/node active. */
  isActive: (e: Editor) => boolean;
  /** Runs the command via the editor chain. */
  run: (e: Editor) => void;
}

const BUTTONS: ToolbarButtonSpec[] = [
  {
    src: "/kudos/editor/bold.svg",
    labelKey: "kudos.editor.bold",
    isActive: (e) => e.isActive("bold"),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    src: "/kudos/editor/italic.svg",
    labelKey: "kudos.editor.italic",
    isActive: (e) => e.isActive("italic"),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    src: "/kudos/editor/strikethrough.svg",
    labelKey: "kudos.editor.strikethrough",
    isActive: (e) => e.isActive("strike"),
    run: (e) => e.chain().focus().toggleStrike().run(),
  },
  {
    src: "/kudos/editor/number-list.svg",
    labelKey: "kudos.editor.numbered_list",
    isActive: (e) => e.isActive("orderedList"),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    src: "/kudos/editor/link.svg",
    labelKey: "kudos.editor.link",
    isActive: (e) => e.isActive("link"),
    run: (e) => {
      const previous = e.getAttributes("link").href as string | undefined;
      const url = window.prompt("URL", previous ?? "https://");
      if (url === null) return;
      if (url === "") {
        e.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      e
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url, target: "_blank", rel: "noopener noreferrer" })
        .run();
    },
  },
  {
    src: "/kudos/editor/quote.svg",
    labelKey: "kudos.editor.quote",
    isActive: (e) => e.isActive("blockquote"),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
];

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const { t } = useTranslation();
  // Segmented button group per design: each control is a 56×40 bordered cell
  // (#998C5F), corners of the row rounded to meet the text field below. `-ml-px`
  // collapses the shared vertical border between adjacent cells.
  return (
    <div className="flex items-stretch">
      {BUTTONS.map((btn, i) => {
        const active = editor ? btn.isActive(editor) : false;
        return (
          <button
            key={btn.labelKey}
            type="button"
            aria-label={t(btn.labelKey)}
            aria-pressed={active}
            disabled={!editor}
            onClick={() => editor && btn.run(editor)}
            className={`flex h-10 w-14 shrink-0 items-center justify-center border border-[#998C5F] transition-colors disabled:opacity-50 ${
              i === 0 ? "rounded-tl-lg" : "-ml-px"
            } ${active ? "bg-[#FFEA9E]/60" : "hover:bg-[#FFEA9E]/40"}`}
          >
            <Image
              src={btn.src}
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
          </button>
        );
      })}
      <button
        type="button"
        className="-ml-px flex h-10 flex-1 items-center justify-end rounded-tr-lg border border-[#998C5F] px-4 font-montserrat text-sm font-bold text-[#B72927] underline-offset-2 hover:underline"
      >
        {t("kudos.editor.community_guidelines")}
      </button>
    </div>
  );
}
