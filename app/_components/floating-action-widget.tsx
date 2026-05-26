"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { createKudos } from "@/app/sun-kudos/_actions/create-kudos";
import { KudosWriteDialog } from "@/app/sun-kudos/_components/kudos-write-dialog";

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
      {mode === "rules" && <RulesModal onClose={collapse} />}

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

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Thể lệ SAA 2025"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 max-h-[80vh] w-full max-w-[640px] overflow-y-auto rounded-2xl border border-[#998C5F] bg-[#00070C] p-8 shadow-2xl">
        <h2 className="font-montserrat mb-6 text-2xl font-bold text-[#FFEA9E]">
          Thể lệ
        </h2>

        <section className="mb-6">
          <h3 className="font-montserrat mb-2 text-sm font-bold uppercase tracking-wide text-[#FFEA9E]">
            Người nhận Kudos: Huy hiệu Hero cho những ảnh hưởng tích cực
          </h3>
          <p className="font-montserrat text-sm leading-6 text-white/80">
            Dựa trên số lượng đồng đội gửi trao Kudos, bạn sẽ sở hữu Huy hiệu
            Hero tương ứng (New Hero, Rising Hero, Super Hero, Legend Hero),
            được hiển thị trực tiếp cạnh tên profile.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="font-montserrat mb-2 text-sm font-bold uppercase tracking-wide text-[#FFEA9E]">
            Người gửi Kudos: Sưu tập trọn bộ 6 icon, nhận ngay phần quà bí ẩn
          </h3>
          <p className="font-montserrat text-sm leading-6 text-white/80">
            Mỗi lời Kudos bạn gửi sẽ được đăng tải trên hệ thống và nhận về
            những lượt tim từ cộng đồng Sunner. Cứ mỗi 5 lượt tim, bạn sẽ được
            mở 1 Secret Box, với cơ hội nhận về một trong 6 icon độc quyền của
            SAA. Sưu tập trọn bộ 6 icon để nhận phần quà bí ẩn từ SAA 2025.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="font-montserrat mb-2 text-sm font-bold uppercase tracking-wide text-[#FFEA9E]">
            Kudos Quốc Dân
          </h3>
          <p className="font-montserrat text-sm leading-6 text-white/80">
            5 Kudos nhận về nhiều tim nhất toàn Sun* sẽ chính thức trở thành
            Kudos Quốc Dân và được trao phần thưởng đặc biệt từ SAA 2025: Root
            Further.
          </p>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-montserrat rounded-full bg-[#FFEA9E] px-6 py-3 text-sm font-bold text-[#00101A] transition-opacity hover:brightness-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
