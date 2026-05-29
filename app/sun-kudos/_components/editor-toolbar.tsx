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
  return (
    <div className="flex items-center justify-between border-b border-[#998C5F]/30 px-3 py-2">
      <div className="flex items-center gap-1">
        {BUTTONS.map((btn) => {
          const active = editor ? btn.isActive(editor) : false;
          return (
            <button
              key={btn.labelKey}
              type="button"
              aria-label={t(btn.labelKey)}
              aria-pressed={active}
              disabled={!editor}
              onClick={() => editor && btn.run(editor)}
              className={`flex h-8 w-8 items-center justify-center rounded transition-colors disabled:opacity-50 ${
                active
                  ? "bg-[#FFEA9E]/60 text-[#00101A]"
                  : "text-[#998C5F] hover:bg-[#FFEA9E]/40"
              }`}
            >
              <Image
                src={btn.src}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
              />
            </button>
          );
        })}
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
