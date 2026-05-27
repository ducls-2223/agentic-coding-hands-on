"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslation } from "@/app/_components/use-translation";

interface HashtagChipsProps {
  tags: string[];
  onChange: (next: string[]) => void;
  max?: number;
  disabled?: boolean;
}

export function HashtagChips({
  tags,
  onChange,
  max = 5,
  disabled,
}: HashtagChipsProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  // Enter triggers commit synchronously; the input then unmounts and React
  // may also fire blur → a second commit(). Guard against the double-fire.
  const committingRef = useRef(false);

  const atMax = tags.length >= max;

  function commit() {
    if (committingRef.current) return;
    committingRef.current = true;
    const cleaned = draft.trim().replace(/^#+/, "");
    setDraft("");
    setEditing(false);
    if (!cleaned) {
      committingRef.current = false;
      return;
    }
    const next = `#${cleaned}`;
    if (!tags.includes(next)) {
      onChange([...tags, next]);
    }
    committingRef.current = false;
  }

  function remove(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="font-montserrat inline-flex items-center gap-1.5 rounded-full border border-[#998C5F] bg-white px-3 py-1.5 text-sm font-bold text-[#998C5F]"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            disabled={disabled}
            aria-label={t("kudos.dialog.remove_hashtag", { tag })}
            className="rounded-full p-0.5 hover:bg-[#998C5F]/10 disabled:opacity-50"
          >
            <Image
              src="/kudos/editor/close-tiny.svg"
              alt=""
              width={10}
              height={10}
              aria-hidden="true"
            />
          </button>
        </span>
      ))}

      {!atMax && !editing && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={disabled}
          className="font-montserrat inline-flex items-center gap-1.5 rounded-full border border-[#998C5F] bg-white px-3 py-1.5 text-sm font-bold text-[#00101A] transition-colors hover:bg-[#FFF8E1] disabled:opacity-50"
        >
          <Image
            src="/kudos/editor/plus.svg"
            alt=""
            width={12}
            height={12}
            aria-hidden="true"
          />
          <span>{t("kudos.dialog.hashtag_button")}</span>
          <span className="text-xs font-medium text-[#998C5F]">
            {t("common.max")} {max}
          </span>
        </button>
      )}

      {editing && (
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              setDraft("");
              setEditing(false);
            }
          }}
          placeholder="Inspiring"
          className="font-montserrat rounded-full border border-[#998C5F] bg-white px-3 py-1.5 text-sm font-bold text-[#00101A] outline-none focus:border-[#00101A]"
        />
      )}
    </div>
  );
}
