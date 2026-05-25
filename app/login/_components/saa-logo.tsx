import Image from "next/image";

/**
 * SAA brand mark for the login header.
 *
 * Asset: public/login/logo-saa.png (52×48, sourced from MoMorph node
 * I662:14391;178:1033;178:1030).
 */
export default function SaaLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/login/logo-saa.png"
      alt="Sun* Annual Awards 2025"
      width={52}
      height={48}
      priority
      className={className}
    />
  );
}
