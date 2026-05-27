import Image from "next/image";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

export async function RootFurtherContent() {
  const lang = await getLanguage();
  return (
    <section className="relative w-full bg-[#0A0E1B] py-[96px]">
      <div className="mx-auto max-w-[1512px] px-[144px]">
        <div className="relative mx-auto max-w-[1152px] rounded-lg px-[104px] py-[120px] flex flex-col items-center gap-8">
          {/* Decorative ROOT + FURTHER background typography */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[50%] flex flex-col items-center pointer-events-none select-none">
            <Image
              src="/home/root-text.png"
              alt=""
              width={189}
              height={67}
              className="opacity-80"
            />
            <Image
              src="/home/further-text.png"
              alt=""
              width={290}
              height={67}
              className="opacity-80"
            />
          </div>

          {/* Body paragraphs */}
          <p
            className="font-montserrat text-2xl font-bold leading-8 text-white text-justify w-full whitespace-pre-line"
          >
            {t(lang, "home.root_further.para1")}
          </p>

          {/* Pull quote */}
          <blockquote className="w-full text-center font-montserrat text-xl font-bold leading-8 text-white whitespace-pre-line">
            {t(lang, "home.root_further.quote")}
          </blockquote>

          {/* Closing paragraph */}
          <p
            className="font-montserrat text-2xl font-bold leading-8 text-white text-justify w-full whitespace-pre-line"
          >
            {t(lang, "home.root_further.para2")}
          </p>
        </div>
      </div>
    </section>
  );
}
