import type { ReactNode } from "react";

interface AwardsLayoutProps {
  menu: ReactNode;
  children: ReactNode;
}

/**
 * Two-column wrapper: sticky left nav (178px) + scrollable award list (853px).
 * Single column on mobile (< lg breakpoint).
 * Mirrors the mms_B_Hệ thống giải thưởng Figma frame (gap: 80px).
 */
export function AwardsLayout({ menu, children }: AwardsLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-[144px]">
      <div className="flex flex-row gap-20 items-start">
        {/* Left: sticky menu (178px wide) */}
        <div className="hidden lg:block w-[178px] flex-shrink-0 sticky top-24 self-start">
          {menu}
        </div>

        {/* Right: award detail list */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
