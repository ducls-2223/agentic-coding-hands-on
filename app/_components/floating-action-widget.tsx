"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { createKudos } from "@/app/sun-kudos/_actions/create-kudos";
import { KudosWriteDialog } from "@/app/sun-kudos/_components/kudos-write-dialog";
import { RulesModal } from "./rules-modal";

type Mode = "collapsed" | "expanded" | "dialog" | "rules";

export function FloatingActionWidget() {
  const [mode, setMode] = useState<Mode>("collapsed");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandedRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const collapse = useCallback(() => setMode("collapsed"), []);

  // Click outside the expanded column collapses it (but does not close the
  // dialog/rules overlays — those have their own backdrops).
  useEffect(() => {
    if (mode !== "expanded") return;
    function onPointerDown(e: MouseEvent) {
      if (!expandedRef.current) return;
      if (expandedRef.current.contains(e.target as Node)) return;
      setMode("collapsed");
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [mode]);

  // Escape closes whichever overlay is on top.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (mode === "rules" || mode === "expanded") setMode("collapsed");
      // Dialog handles its own Escape (gated by pending state).
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode]);

  const handleDialogSuccess = useCallback(() => {
    setMode("collapsed");
    showToast("Kudos đã được gửi!");
  }, [showToast]);

  return (
    <>
      {/* Collapsed pill — 41x32 yellow lozenge with pen + lightning + "/" */}
      {mode === "collapsed" && (
        <button
          type="button"
          onClick={() => setMode("expanded")}
          aria-label="Mở widget hành động nhanh"
          className="fixed bottom-6 right-6 z-40 flex h-[44px] w-[64px] items-center justify-center gap-1 rounded-full bg-[#FFEA9E] px-3 shadow-lg transition-shadow hover:shadow-xl"
        >
          <Image
            src="/widget/widget-pen.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
          <span className="text-[#00101A]/60 font-bold">/</span>
          <Image
            src="/widget/widget-thunder.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
        </button>
      )}

      {/* Expanded column — 3 stacked buttons + close */}
      {mode === "expanded" && (
        <div
          ref={expandedRef}
          className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
          role="menu"
          aria-label="Widget hành động nhanh"
        >
          <button
            type="button"
            onClick={() => setMode("rules")}
            role="menuitem"
            className="font-montserrat flex items-center gap-2 rounded-full bg-[#FFEA9E] px-5 py-3 text-sm font-bold text-[#00101A] shadow-lg transition-shadow hover:shadow-xl"
          >
            <Image
              src="/widget/widget-thunder.svg"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            Thể lệ
          </button>
          <button
            type="button"
            onClick={() => setMode("dialog")}
            role="menuitem"
            className="font-montserrat flex items-center gap-2 rounded-full bg-[#FFEA9E] px-5 py-3 text-sm font-bold text-[#00101A] shadow-lg transition-shadow hover:shadow-xl"
          >
            <Image
              src="/widget/widget-pen.svg"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            Viết KUDOS
          </button>
          <button
            type="button"
            onClick={collapse}
            aria-label="Đóng widget"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B72927] shadow-lg transition-shadow hover:shadow-xl"
          >
            <Image
              src="/widget/widget-close.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
          </button>
        </div>
      )}

      {/* Write-kudos dialog instance (global, fired by FAB) */}
      {mode === "dialog" && (
        <KudosWriteDialog
          action={createKudos}
          onSuccess={handleDialogSuccess}
          onClose={collapse}
        />
      )}

      {/* Rules modal */}
      {mode === "rules" && (
        <RulesModal
          onClose={collapse}
          onWriteKudos={() => setMode("dialog")}
        />
      )}

      {/* Toast — anchored to top-right so it does not overlap the FAB */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="font-montserrat fixed bottom-24 right-6 z-50 rounded-lg bg-[#FFEA9E] px-4 py-2 text-sm font-bold text-[#00101A] shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}

