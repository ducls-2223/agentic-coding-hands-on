"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

import { useTranslation } from "@/app/_components/use-translation";
import { uploadKudosImage } from "../_actions/upload-kudos-image";

interface ImageUploaderProps {
  /** Currently uploaded image URLs. */
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  max?: number;
}

const ACCEPT = "image/jpeg,image/png";
const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUploader({
  value,
  onChange,
  disabled,
  max = 5,
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const atMax = value.length >= max;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-picking the same file
    if (files.length === 0) return;
    setError(null);

    // Local pre-flight to avoid pointless server round-trips.
    const remaining = max - value.length;
    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      if (!file.type.startsWith("image/")) {
        setError(t("kudos.dialog.image_invalid_type"));
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(t("kudos.dialog.image_too_large"));
        continue;
      }
      setBusy(true);
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadKudosImage(fd);
      setBusy(false);
      if (!res.ok || !res.url) {
        setError(res.error ?? t("kudos.dialog.image_upload_failed"));
        continue;
      }
      onChange([...value, res.url]);
      if (value.length + 1 >= max) break;
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {value.map((url) => (
          <div
            key={url}
            className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#998C5F]"
          >
            <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              disabled={disabled}
              aria-label={t("kudos.dialog.image_remove")}
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#B72927] text-white text-xs"
            >
              ×
            </button>
          </div>
        ))}

        {!atMax && (
          <>
            <label
              htmlFor={inputId}
              aria-disabled={disabled || busy || undefined}
              className={`font-montserrat inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#998C5F] bg-white px-3 py-1.5 text-sm font-bold text-[#00101A] transition-colors hover:bg-[#FFF8E1] ${
                disabled || busy ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <Image
                src="/kudos/editor/plus.svg"
                alt=""
                width={12}
                height={12}
                aria-hidden="true"
              />
              <span>{t("kudos.dialog.image_button")}</span>
              <span className="text-xs font-medium text-[#998C5F]">
                {t("common.max")} {max}
              </span>
            </label>
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              disabled={disabled || busy}
              onChange={onPick}
              className="sr-only"
            />
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-[#B72927]">
          {error}
        </p>
      )}
    </div>
  );
}
