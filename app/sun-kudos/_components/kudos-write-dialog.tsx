"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/app/_components/use-translation";

import type { CreateKudosResult } from "../_actions/create-kudos";
import { HashtagChips } from "./hashtag-chips";
import { ImageUploader } from "./image-uploader";
import { KudosEditor, type KudosEditorHandle } from "./kudos-editor";
import { RecipientAutocomplete } from "./recipient-autocomplete";
import type { Sunner } from "../_lib/fetch-sunners";

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
  /** Optional pre-fetched sunners to seed the autocomplete. */
  initialSunners?: Sunner[];
}

export function KudosWriteDialog({
  action,
  onSuccess,
  onClose,
  initialSunners,
}: KudosWriteDialogProps) {
  const { t } = useTranslation();

  // Form state.
  const [recipientId, setRecipientId] = useState("");
  const [honorTitle, setHonorTitle] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");
  const [contentLen, setContentLen] = useState(0);

  const editorRef = useRef<KudosEditorHandle>(null);
  const [state, formAction, pending] = useActionState(action, null);
  const successFiredRef = useRef(false);

  // Wrap the action so we can inject all the captured fields into the
  // FormData (recipient_id, hashtags JSON, images JSON, etc.).
  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("content", editorRef.current?.getHtml() ?? "");
    fd.set("recipient_id", recipientId);
    fd.set("honor_title", honorTitle);
    fd.set("is_anonymous", String(anonymous));
    if (anonymous) fd.set("anonymous_name", anonymousName);
    fd.set("hashtags", JSON.stringify(hashtags));
    fd.set("images", JSON.stringify(images));
    return fd;
  }

  // Escape closes (only when idle).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  // Bubble success up to parent. Fires once per mount.
  useEffect(() => {
    if (state?.ok && !successFiredRef.current) {
      successFiredRef.current = true;
      onSuccess();
    }
  }, [state, onSuccess]);

  // Submit button disabled until all required fields populated.
  const submitDisabled =
    pending ||
    contentLen === 0 ||
    recipientId === "" ||
    hashtags.length === 0 ||
    (anonymous && anonymousName.trim().length === 0);

  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("kudos.dialog.title")}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={pending ? undefined : onClose}
        aria-hidden="true"
      />

      <form
        action={() => formAction(buildFormData())}
        className="font-montserrat relative z-10 flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl bg-[#FFF8E1] shadow-2xl"
      >
        <div className="flex-1 overflow-y-auto px-10 pt-10">
          <h2 className="mb-6 text-center text-2xl font-bold text-[#00101A]">
            {t("kudos.dialog.title")}
          </h2>

          {/* Người nhận */}
          <div className="mb-6 grid grid-cols-[140px_1fr] items-start gap-x-6 gap-y-2">
            <label
              htmlFor="kudos-recipient"
              className="pt-3 text-base font-bold text-[#00101A]"
            >
              {t("kudos.dialog.recipient_label")}
              <span className="ml-0.5 text-[#B72927]">{t("common.required")}</span>
            </label>
            <div>
              <RecipientAutocomplete
                inputId="kudos-recipient"
                value={recipientId}
                onChange={(id) => setRecipientId(id)}
                initialOptions={initialSunners}
                disabled={pending}
                hasError={!!fieldErrors.recipient_id}
              />
              {fieldErrors.recipient_id && (
                <p role="alert" className="mt-1 text-xs font-medium text-[#B72927]">
                  {fieldErrors.recipient_id}
                </p>
              )}
            </div>
          </div>

          {/* Danh hiệu (optional) */}
          <div className="mb-6 grid grid-cols-[140px_1fr] items-start gap-x-6 gap-y-2">
            <label
              htmlFor="kudos-honor-title"
              className="pt-3 text-base font-bold text-[#00101A]"
            >
              {t("kudos.dialog.honor_label")}
            </label>
            <div>
              <input
                id="kudos-honor-title"
                type="text"
                value={honorTitle}
                onChange={(e) => setHonorTitle(e.target.value)}
                disabled={pending}
                placeholder={t("kudos.dialog.honor_placeholder")}
                className="h-14 w-full rounded-lg border border-[#998C5F] bg-white px-4 text-base text-[#00101A] placeholder:text-[#998C5F] focus:border-[#00101A] focus:outline-none disabled:opacity-60"
              />
              <p className="mt-2 text-xs leading-5 text-[#998C5F]">
                {t("kudos.dialog.honor_hint_line1")}
                <br />
                {t("kudos.dialog.honor_hint_line2")}
              </p>
            </div>
          </div>

          {/* Editor (Tiptap) */}
          <div className="mb-2">
            <KudosEditor
              ref={editorRef}
              disabled={pending}
              hasError={!!fieldErrors.content}
              onChange={setContentLen}
            />
            {fieldErrors.content && (
              <p role="alert" className="mt-1 text-xs font-medium text-[#B72927]">
                {fieldErrors.content}
              </p>
            )}
          </div>
          <p className="mb-6 text-center text-sm font-bold text-[#00101A]">
            {t("kudos.dialog.mention_hint")}
          </p>

          {/* Hashtag */}
          <div className="mb-6 grid grid-cols-[140px_1fr] items-start gap-x-6 gap-y-2">
            <label className="pt-2 text-base font-bold text-[#00101A]">
              {t("kudos.dialog.hashtag_label")}
              <span className="ml-0.5 text-[#B72927]">{t("common.required")}</span>
            </label>
            <div>
              <HashtagChips
                tags={hashtags}
                onChange={setHashtags}
                disabled={pending}
              />
              {fieldErrors.hashtags && (
                <p role="alert" className="mt-1 text-xs font-medium text-[#B72927]">
                  {fieldErrors.hashtags}
                </p>
              )}
            </div>
          </div>

          {/* Image upload */}
          <div className="mb-6 grid grid-cols-[140px_1fr] items-start gap-x-6 gap-y-2">
            <label className="pt-2 text-base font-bold text-[#00101A]">
              {t("kudos.dialog.image_label")}
            </label>
            <div>
              <ImageUploader value={images} onChange={setImages} disabled={pending} />
              {fieldErrors.images && (
                <p role="alert" className="mt-1 text-xs font-medium text-[#B72927]">
                  {fieldErrors.images}
                </p>
              )}
            </div>
          </div>

          {/* Anonymous toggle + name */}
          <label className="mb-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              disabled={pending}
              className="h-5 w-5 rounded border-[#998C5F] accent-[#998C5F]"
            />
            <span className="text-sm font-bold text-[#00101A]">
              {t("kudos.dialog.anonymous")}
            </span>
          </label>
          {anonymous && (
            <div className="mb-4">
              <input
                type="text"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                disabled={pending}
                placeholder={t("kudos.dialog.anonymous_name_placeholder")}
                aria-invalid={!!fieldErrors.anonymous_name || undefined}
                className={`h-12 w-full rounded-lg border bg-white px-4 text-sm text-[#00101A] placeholder:text-[#998C5F] focus:border-[#00101A] focus:outline-none disabled:opacity-60 ${
                  fieldErrors.anonymous_name ? "border-[#B72927]" : "border-[#998C5F]"
                }`}
              />
              {fieldErrors.anonymous_name && (
                <p role="alert" className="mt-1 text-xs font-medium text-[#B72927]">
                  {fieldErrors.anonymous_name}
                </p>
              )}
            </div>
          )}

          {state && !state.ok && state.error && !state.fieldErrors && (
            <p
              role="alert"
              className="mb-4 text-sm font-medium text-[#B72927]"
            >
              {state.error}
            </p>
          )}
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
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitDisabled}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFEA9E] px-6 py-3 text-sm font-bold text-[#00101A] transition-opacity hover:brightness-95 disabled:opacity-40"
          >
            {pending ? (
              t("common.sending")
            ) : (
              <>
                {t("common.send")}
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
