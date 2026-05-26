"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import type { CreateKudosResult } from "../_actions/create-kudos";

interface KudosWriteDialogProps {
  /** Server action that persists a kudos. Bound by the parent. */
  action: (
    prevState: CreateKudosResult | null,
    formData: FormData,
  ) => Promise<CreateKudosResult>;
  /** Called after a successful submit so the parent can close + toast. */
  onSuccess: () => void;
  /** Called when the user closes the dialog without submitting. */
  onClose: () => void;
}

export function KudosWriteDialog({
  action,
  onSuccess,
  onClose,
}: KudosWriteDialogProps) {
  const [text, setText] = useState("");
  const [state, formAction, pending] = useActionState(action, null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea once on mount only — re-running on dependency changes
  // would steal focus back from any pending element interaction.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Escape closes the dialog (gated by pending so submit can't be aborted).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  // Bubble success up to the parent (which closes us + shows a toast).
  useEffect(() => {
    if (state?.ok) onSuccess();
  }, [state, onSuccess]);

  const trimmed = text.trim();
  const disabled = pending || trimmed.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Ghi nhận lời cảm ơn"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={pending ? undefined : onClose}
        aria-hidden="true"
      />

      <form
        action={formAction}
        className="relative z-10 w-full max-w-[640px] rounded-2xl border border-[#998C5F] bg-[#00070C] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-montserrat mb-6 text-xl font-bold text-[#FFEA9E]">
          Gửi lời cảm ơn
        </h2>

        <textarea
          ref={textareaRef}
          name="content"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={pending}
          placeholder="Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"
          className="font-montserrat h-[180px] w-full resize-none rounded-xl border border-[#2E3940] bg-[#0A0E1B] p-4 text-base text-white transition-colors placeholder:text-white/30 focus:border-[#998C5F] focus:outline-none disabled:opacity-60"
        />

        {state && !state.ok && state.error && (
          <p
            role="alert"
            className="font-montserrat mt-3 text-sm font-medium text-[#FF6B6B]"
          >
            {state.error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="font-montserrat rounded-full border border-[#998C5F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="font-montserrat rounded-full bg-[#FFEA9E] px-6 py-3 text-sm font-bold text-[#00101A] transition-opacity hover:brightness-95 disabled:opacity-40"
          >
            {pending ? "Đang gửi…" : "Gửi"}
          </button>
        </div>
      </form>
    </div>
  );
}
