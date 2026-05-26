"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";

import type { CreateKudosResult } from "../_actions/create-kudos";
import { EditorToolbar } from "./editor-toolbar";
import { HashtagChips } from "./hashtag-chips";
import { RecipientAutocomplete } from "./recipient-autocomplete";

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
  // Submitted to the server action.
  const [content, setContent] = useState("");

  // Visual-only fields — captured locally, not sent to the action.
  const [recipient, setRecipient] = useState("");
  const [honorTitle, setHonorTitle] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(false);

  const [state, formAction, pending] = useActionState(action, null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Guard so an unstable `onSuccess` reference from the parent can't trigger
  // a second bubble on a benign re-render after submit.
  const successFiredRef = useRef(false);

  // Focus textarea once on mount.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Escape closes (only when not pending so submit can't be aborted mid-flight).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  // Bubble success up to parent (which closes + toasts). Fires once per mount.
  useEffect(() => {
    if (state?.ok && !successFiredRef.current) {
      successFiredRef.current = true;
      onSuccess();
    }
  }, [state, onSuccess]);

  const trimmed = content.trim();
  const disabled = pending || trimmed.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Gửi lời cám ơn và ghi nhận đến đồng đội"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={pending ? undefined : onClose}
        aria-hidden="true"
      />

      <form
        action={formAction}
        className="font-montserrat relative z-10 flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl bg-[#FFF8E1] shadow-2xl"
      >
        <div className="flex-1 overflow-y-auto px-10 pt-10">
          <h2 className="mb-6 text-center text-2xl font-bold text-[#00101A]">
            Gửi lời cám ơn và ghi nhận đến đồng đội
          </h2>

          {/* Người nhận */}
          <div className="mb-6 grid grid-cols-[140px_1fr] items-start gap-x-6 gap-y-2">
            <label
              htmlFor="kudos-recipient"
              className="pt-3 text-base font-bold text-[#00101A]"
            >
              Người nhận
              <span className="ml-0.5 text-[#B72927]">*</span>
            </label>
            <RecipientAutocomplete
              inputId="kudos-recipient"
              value={recipient}
              onChange={setRecipient}
              disabled={pending}
            />
          </div>

          {/* Danh hiệu */}
          <div className="mb-6 grid grid-cols-[140px_1fr] items-start gap-x-6 gap-y-2">
            <label
              htmlFor="kudos-honor-title"
              className="pt-3 text-base font-bold text-[#00101A]"
            >
              Danh hiệu
              <span className="ml-0.5 text-[#B72927]">*</span>
            </label>
            <div>
              <input
                id="kudos-honor-title"
                type="text"
                value={honorTitle}
                onChange={(e) => setHonorTitle(e.target.value)}
                disabled={pending}
                placeholder="Dành tặng một danh hiệu cho đồng đội"
                className="h-14 w-full rounded-lg border border-[#998C5F] bg-white px-4 text-base text-[#00101A] placeholder:text-[#998C5F] focus:border-[#00101A] focus:outline-none disabled:opacity-60"
              />
              <p className="mt-2 text-xs leading-5 text-[#998C5F]">
                Ví dụ: Người truyền động lực cho tôi.
                <br />
                Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.
              </p>
            </div>
          </div>

          {/* Editor (toolbar + textarea) */}
          <div className="mb-2 overflow-hidden rounded-lg border border-[#998C5F] bg-white">
            <EditorToolbar />
            <textarea
              ref={textareaRef}
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={pending}
              placeholder="Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!"
              className="block h-[180px] w-full resize-none bg-transparent px-4 py-3 text-base text-[#00101A] placeholder:text-[#998C5F] focus:outline-none disabled:opacity-60"
            />
          </div>
          <p className="mb-6 text-center text-sm font-bold text-[#00101A]">
            Bạn có thể &ldquo;@ + tên&rdquo; để nhắc tới đồng nghiệp khác
          </p>

          {state && !state.ok && state.error && (
            <p
              role="alert"
              className="mb-4 text-sm font-medium text-[#B72927]"
            >
              {state.error}
            </p>
          )}

          {/* Hashtag */}
          <div className="mb-6 grid grid-cols-[140px_1fr] items-start gap-x-6 gap-y-2">
            <label className="pt-2 text-base font-bold text-[#00101A]">
              Hashtag
              <span className="ml-0.5 text-[#B72927]">*</span>
            </label>
            <HashtagChips
              tags={hashtags}
              onChange={setHashtags}
              disabled={pending}
            />
          </div>

          {/* Image (disabled placeholder) */}
          <div className="mb-6 grid grid-cols-[140px_1fr] items-start gap-x-6 gap-y-2">
            <label className="pt-2 text-base font-bold text-[#00101A]">
              Image
            </label>
            <button
              type="button"
              disabled
              title="Coming soon"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#998C5F] bg-white px-3 py-1.5 text-sm font-bold text-[#00101A] opacity-50"
            >
              <Image
                src="/kudos/editor/plus.svg"
                alt=""
                width={12}
                height={12}
                aria-hidden="true"
              />
              <span>Image</span>
              <span className="text-xs font-medium text-[#998C5F]">
                Tối đa 5
              </span>
            </button>
          </div>

          {/* Anonymous toggle */}
          <label className="mb-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              disabled={pending}
              className="h-5 w-5 rounded border-[#998C5F] accent-[#998C5F]"
            />
            <span className="text-sm font-bold text-[#00101A]">
              Gửi lời cám ơn và ghi nhận ẩn danh
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-[#998C5F]/30 bg-[#FFF8E1] px-10 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex items-center gap-2 rounded-full border border-[#998C5F] bg-white px-6 py-3 text-sm font-bold text-[#00101A] transition-colors hover:bg-[#FFEA9E]/30 disabled:opacity-50"
          >
            <Image
              src="/widget/widget-close.svg"
              alt=""
              width={14}
              height={14}
              className="invert"
              aria-hidden="true"
            />
            Hủy
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFEA9E] px-6 py-3 text-sm font-bold text-[#00101A] transition-opacity hover:brightness-95 disabled:opacity-40"
          >
            {pending ? (
              "Đang gửi…"
            ) : (
              <>
                Gửi
                <Image
                  src="/kudos/editor/send.svg"
                  alt=""
                  width={16}
                  height={16}
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
