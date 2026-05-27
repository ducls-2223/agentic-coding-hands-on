import Image from "next/image";
import type { ReactNode } from "react";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

/**
 * Sun* Kudos banner. Hosts the title + KUDOS branded logo over the artwork,
 * and accepts `children` (typically the `<KudosInputBar />`) so the input
 * sits inside the banner per the Figma layout instead of below it.
 */
interface KudosKeyvisualProps {
  children?: ReactNode;
}

export async function KudosKeyvisual({ children }: KudosKeyvisualProps) {
  const lang = await getLanguage();
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/kudos/kv-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(25deg, #00101A 14.74%, rgba(0, 19, 32, 0.00) 47.8%)",
          }}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 flex flex-col gap-10 px-[144px] pt-[171px] pb-16">
        <div className="flex flex-col gap-2">
          <h1
            className="font-montserrat text-[36px] font-bold leading-[44px] text-[#FFEA9E]"
            style={{ letterSpacing: 0 }}
          >
            {t(lang, "sun_kudos.kv_title")}
          </h1>
          <Image
            src="/kudos/kv-logo.svg"
            alt="SAA 2025 KUDOS"
            width={593}
            height={104}
          />
        </div>

        {children}
      </div>
    </section>
  );
}
