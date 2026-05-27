"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { CountdownTimer } from "@/app/_components/countdown-timer";
import { useTranslation } from "@/app/_components/use-translation";

const REDIRECT_DELAY_MS = 3000;

export function PrelaunchContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [eventLive, setEventLive] = useState(false);

  // Triggered exactly once by CountdownTimer when the clock hits 00:00:00.
  // We let the proxy handle the actual redirect on the next request — calling
  // `router.refresh()` re-runs server-side proxy/layout for the current path.
  const handleComplete = useCallback(() => {
    setEventLive(true);
    setTimeout(() => router.refresh(), REDIRECT_DELAY_MS);
  }, [router]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {eventLive ? (
        <p className="font-montserrat text-3xl font-bold leading-10 text-[#FFEA9E]">
          {t("common.event_live")} {t("common.redirecting")}
        </p>
      ) : (
        <CountdownTimer
          title={t("countdown.event_starts")}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
