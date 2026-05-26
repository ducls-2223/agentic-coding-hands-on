"use client";

import Image from "next/image";
import { useState } from "react";
import { KudosWriteDialog } from "./kudos-write-dialog";

export function KudosInputBar() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex w-full items-center gap-6">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex flex-1 items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-4 py-6 text-left transition-colors hover:bg-[rgba(255,234,158,0.18)]"
          style={{ maxWidth: "738px" }}
          aria-label="Mở hộp ghi nhận lời cảm ơn"
        >
          <Image
            src="/home/widget-pencil.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
          <span className="font-montserrat flex-1 text-base font-bold leading-6 text-white/60">
            Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?
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
            Tìm kiếm profile Sunner
          </span>
        </div>
      </div>

      {dialogOpen && (
        <KudosWriteDialog onClose={() => setDialogOpen(false)} />
      )}
    </>
  );
}
