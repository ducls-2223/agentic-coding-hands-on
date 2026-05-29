"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import type { Sunner } from "../_lib/fetch-sunners";

export interface MentionListHandle {
  onKeyDown: (event: { event: KeyboardEvent }) => boolean;
}

interface MentionListProps {
  items: Sunner[];
  command: (item: { id: string; label: string }) => void;
}

/**
 * Tiptap mention suggestion list renderer. Receives a filtered Sunner[] from
 * the suggestion config and calls `command` with the chosen entry. The Tiptap
 * suggestion controller drives keyboard handling via the imperative handle.
 */
export const MentionList = forwardRef<MentionListHandle, MentionListProps>(
  function MentionList({ items, command }, ref) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      setIndex(0);
    }, [items]);

    function select(i: number) {
      const item = items[i];
      if (!item) return;
      command({ id: item.id, label: item.name });
    }

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (items.length === 0) return false;
        if (event.key === "ArrowUp") {
          setIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          select(index);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="font-montserrat rounded-lg border border-[#998C5F] bg-white px-4 py-2 text-sm text-[#998C5F] shadow-lg">
          —
        </div>
      );
    }

    return (
      <ul
        role="listbox"
        className="font-montserrat min-w-[220px] max-h-60 overflow-y-auto rounded-lg border border-[#998C5F] bg-white py-1 shadow-lg"
      >
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => select(i)}
              onMouseEnter={() => setIndex(i)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-[#00101A] ${
                i === index ? "bg-[#FFF8E1]" : "hover:bg-[#FFF8E1]"
              }`}
            >
              <span className="font-bold">@{item.name}</span>
              <span className="text-xs text-[#998C5F]">{item.level}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  },
);
