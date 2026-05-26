import Image from "next/image";

/**
 * Floating widget button — fixed bottom-right, static (click is no-op).
 * Shows pencil + slash + SAA icons in a yellow pill.
 */
export function WidgetButton() {
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <button
        aria-label="Quick actions"
        className="flex h-16 w-[106px] items-center justify-start gap-2 rounded-full bg-[#FFEA9E] px-4 shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_0_6px_0_#FAE287] hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.35),0_0_8px_0_#FAE287] transition-shadow"
      >
        {/* Pencil + SAA icons */}
        <span className="flex items-center gap-2">
          <Image
            src="/home/widget-pencil.svg"
            alt=""
            width={24}
            height={24}
          />
          <span className="text-[#00101A] font-bold">/</span>
          <Image
            src="/home/widget-saa.svg"
            alt=""
            width={20}
            height={18}
          />
        </span>
      </button>
    </div>
  );
}
