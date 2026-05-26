"use client";

import { useEffect, useRef, useState } from "react";

interface KudosWriteDialogProps {
  onClose: () => void;
}

export function KudosWriteDialog({ onClose }: KudosWriteDialogProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit() {
    if (!text.trim()) return;
    // In-memory only — just close the dialog
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Ghi nhận lời cảm ơn"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-[640px] rounded-2xl border border-[#998C5F] bg-[#00070C] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-montserrat mb-6 text-xl font-bold text-[#FFEA9E]">
          Gửi lời cảm ơn
        </h2>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"
          className="font-montserrat h-[180px] w-full resize-none rounded-xl border border-[#2E3940] bg-[#0A0E1B] p-4 text-base text-white transition-colors placeholder:text-white/30 focus:border-[#998C5F] focus:outline-none"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="font-montserrat rounded-full border border-[#998C5F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Huỷ
          </button>
          <button
            type="button"
            disabled={!text.trim()}
            onClick={handleSubmit}
            className="font-montserrat rounded-full bg-[#FFEA9E] px-6 py-3 text-sm font-bold text-[#00101A] transition-opacity hover:brightness-95 disabled:opacity-40"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
