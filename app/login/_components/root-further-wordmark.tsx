import Image from "next/image";

/**
 * "ROOT FURTHER" hero wordmark.
 *
 * Asset: public/login/root-further.png (451×200, sourced from MoMorph node
 * 2939:9548 — MM_MEDIA_Root Further Logo).
 *
 * Design: mms_B.1_Key Visual container is 1152px wide (full column width).
 * At 1440px viewport the wordmark spans roughly 1152/1440 ≈ 80% of width.
 * Use max-w-md on mobile, scale up to max-w-lg / max-w-xl on desktop.
 */
export default function RootFurtherWordmark() {
  return (
    <Image
      src="/login/root-further.png"
      alt="ROOT FURTHER"
      width={451}
      height={200}
      priority
      className="h-auto w-full max-w-md md:max-w-lg lg:max-w-xl"
    />
  );
}
