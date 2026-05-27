"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/app/_components/use-translation";

interface KudosActionBarProps {
  kudosId: string;
  initialLikes: number;
  showViewDetails?: boolean;
}

/**
 * Heart toggle + Copy Link + optional "Xem chi tiết" (View Details).
 *
 * View Details is rendered as a non-navigating link until the kudos detail
 * route exists (today every `/sun-kudos/[id]` is a 404).
 */
export function KudosActionBar({
  kudosId,
  initialLikes,
  showViewDetails = false,
}: KudosActionBarProps) {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  }

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
  }

  async function copyLink() {
    const url = `${window.location.origin}/sun-kudos/${kudosId}`;
    try {
      if (!navigator.clipboard) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(url);
      showToast(t("common.link_copied"));
    } catch {
      showToast(t("common.copy_link"));
    }
  }

  return (
    <div className="relative flex w-full items-center justify-between">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={toggleLike}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-pressed={liked}
          aria-label={liked ? t("sun_kudos.card.unlike") : t("sun_kudos.card.like")}
        >
          <Image
            src="/kudos/heart.svg"
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
            className="shrink-0"
            style={{
              // Heart asset is red. Desaturate + dim when not liked.
              filter: liked
                ? "none"
                : "grayscale(1) brightness(0.7) opacity(0.65)",
            }}
          />
          <span
            className={`font-montserrat text-sm font-bold leading-5 ${
              liked ? "text-[#FFEA9E]" : "text-[#998C5F]"
            }`}
          >
            {count}
          </span>
        </button>

        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label={t("sun_kudos.card.copy_link")}
        >
          <Image
            src="/kudos/copy-link.svg"
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
            className="opacity-60"
          />
        </button>
      </div>

      {showViewDetails && (
        <button
          type="button"
          onClick={() => showToast(t("sun_kudos.detail_coming_soon"))}
          className="font-montserrat text-sm font-bold text-[#FFEA9E] underline-offset-2 transition-colors hover:underline"
        >
          {t("common.view_details")} →
        </button>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="font-montserrat absolute -top-10 left-0 rounded-lg bg-[#FFEA9E] px-4 py-2 text-xs font-bold text-[#00101A] shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
