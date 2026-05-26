import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Full-width keyvisual banner that hosts the ROOT FURTHER logo AND the
 * page-title block per the Figma layout (mms_3_Keyvisual + mms_A_Title
 * share the same artwork backdrop).
 *
 * Layout:
 *   - Background artwork (reused homepage asset — the page-specific bg
 *     RECTANGLE 2167:5138 is not extractable from MoMorph media APIs)
 *   - Dark gradient mask: opaque on the left where the logo sits, fading
 *     right so the organic artwork stays visible
 *   - Top row: ROOT FURTHER wordmark (Figma KV x=144)
 *   - Bottom row: caller-provided `children` (typically `<AwardsTitle />`)
 */
interface AwardsKeyvisualProps {
  children?: ReactNode;
}

export function AwardsKeyvisual({ children }: AwardsKeyvisualProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: 547 }}
      aria-label="ROOT FURTHER — Sun* Annual Award 2025"
    >
      <Image
        src="/home/keyvisual-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />

      <div
        className="absolute inset-0 bg-linear-to-r from-[#0A0E1B]/95 from-30% via-[#0A0E1B]/55 via-55% to-transparent to-75%"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[547px] flex-col justify-between gap-12 px-6 py-24 md:px-[10vw] lg:px-36">
        {/* Top: ROOT FURTHER wordmark */}
        <Image
          src="/awards/keyvisual.png"
          alt="ROOT FURTHER"
          width={338}
          height={150}
          priority
          className="h-auto w-[220px] md:w-[280px] lg:w-[338px]"
        />

        {/* Bottom: caller content (page title block) */}
        {children}
      </div>
    </section>
  );
}
