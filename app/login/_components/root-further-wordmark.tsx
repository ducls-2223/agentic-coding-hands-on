import Image from "next/image";

/**
 * "ROOT FURTHER" hero wordmark.
 *
 * Asset: public/login/root-further.png (451×200, sourced from MoMorph node
 * 2939:9548 — MM_MEDIA_Root Further Logo).
 */
export default function RootFurtherWordmark() {
  return (
    <Image
      src="/login/root-further.png"
      alt="ROOT FURTHER"
      width={451}
      height={200}
      priority
      className="h-auto w-full max-w-xs md:max-w-sm"
    />
  );
}
