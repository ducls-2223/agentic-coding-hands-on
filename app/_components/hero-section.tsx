import Image from "next/image";
import { LocalizedLink as Link } from "./localized-link";

import { ArrowUpRightIcon } from "./arrow-up-right-icon";
import { CountdownTimer } from "./countdown-timer";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

export async function HeroSection() {
  const lang = await getLanguage();
  return (
    <section className="relative w-full min-h-175 lg:min-h-225 overflow-hidden">
      {/* Full-bleed background */}
      <Image
        src="/home/keyvisual-bg.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[#0A0E1B]/40" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 pb-16 pt-20 sm:px-10 sm:pt-24 lg:px-36 lg:pb-24 lg:pt-24">
        <div className="flex flex-col gap-8 lg:gap-10 max-w-306 mx-auto">
          {/* ROOT FURTHER wordmark */}
          <div className="w-55 sm:w-75 lg:w-112.75">
            <Image
              src="/login/root-further.png"
              alt="Root Further"
              width={451}
              height={200}
              priority
            />
          </div>

          {/* Countdown + event info */}
          <div className="flex flex-col gap-4">
            <CountdownTimer />

            {/* Event info */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-4 lg:gap-15">
                <span className="font-montserrat text-sm sm:text-base font-bold leading-8 text-white">
                  Thời gian:{" "}
                  <span className="text-lg sm:text-2xl text-[#FFEA9E]">
                    18h30
                  </span>
                </span>
                <span className="font-montserrat text-sm sm:text-base font-bold leading-8 text-white">
                  Địa điểm:{" "}
                  <span className="text-lg sm:text-2xl text-[#FFEA9E]">
                    Nhà hát nghệ thuật quân đội
                  </span>
                </span>
              </div>
              <p className="font-montserrat text-sm sm:text-base font-bold leading-6 tracking-[0.5px] text-white">
                Tường thuật trực tiếp tại Group Facebook Sun* Family
              </p>
            </div>
          </div>

          {/* CTA Buttons. Arrow icon is inlined as SVG with `fill="currentColor"`
              so its color inherits from the button's text-color — black/navy
              on the yellow button, white on the dark-bordered button — instead
              of being locked to a single fill from the static asset. */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-10">
            <Link
              href="/awards-information"
              className="flex h-15 items-center gap-2 rounded-lg bg-[#FFEA9E] px-6 py-4 font-montserrat text-sm sm:text-base font-bold text-[#00101A] hover:bg-[#f5de8a] active:bg-[#edd876] transition-colors duration-200"
            >
              {t(lang, "home.awards.cta")}

              <ArrowUpRightIcon />
            </Link>
            <Link
              href="/sun-kudos"
              className="flex h-15 items-center gap-2 rounded-lg border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-6 py-4 font-montserrat text-sm sm:text-base font-bold text-white hover:bg-[rgba(255,234,158,0.20)] active:bg-[rgba(255,234,158,0.30)] transition-colors duration-200"
            >
              {t(lang, "home.kudos.cta")}

              <ArrowUpRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
