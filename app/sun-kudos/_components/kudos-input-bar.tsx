"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { createKudos } from "../_actions/create-kudos";
import { KudosWriteDialog } from "./kudos-write-dialog";
import { useTranslation } from "@/app/_components/use-translation";

export function KudosInputBar() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // Stable reference — the dialog's useEffect depends on this, so any
  // re-creation each render would re-fire the success effect.
  const handleSuccess = useCallback(() => {
    setDialogOpen(false);
    showToast(t("fab.kudos_sent"));
  }, [showToast, t]);

  const handleClose = useCallback(() => setDialogOpen(false), []);

  return (
    <>
      <div className="relative flex w-full items-center gap-6">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex flex-1 items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-4 py-6 text-left transition-colors hover:bg-[rgba(255,234,158,0.18)]"
          style={{ maxWidth: "738px" }}
          aria-label={t("sun_kudos.input_open")}
        >
          <Image
            src="/home/widget-pencil.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
          <span className="font-montserrat flex-1 text-base font-bold leading-6 text-white/60">
            {t("sun_kudos.input_placeholder")}
          </span>
        </button>

        <div
          className="flex items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-4 py-6"
          style={{ width: "381px" }}
        >
          <Image
            src="/kudos/search.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
          <span className="font-montserrat text-base font-bold leading-6 text-white/60">
            {t("sun_kudos.search_sunner")}
          </span>
        </div>

        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="font-montserrat absolute -top-12 left-0 rounded-lg bg-[#FFEA9E] px-4 py-2 text-sm font-bold text-[#00101A] shadow-lg"
          >
            {toast}
          </div>
        )}
      </div>

      {dialogOpen && (
        <KudosWriteDialog
          action={createKudos}
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      )}
    </>
  );
}
