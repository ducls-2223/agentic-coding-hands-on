import Image from "next/image";
import { CSSProperties } from "react";

/**
 * SAA brand mark for the login header.
 *
 * Asset: public/login/logo-saa.png (52×48, sourced from MoMorph node
 * I662:14391;178:1033;178:1030).
 * Design dimensions: 52×56px container (mms_A.1_Logo node I662:14391;186:2166).
 */
export default function SaaLogo({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Image
      src="/login/logo-saa.png"
      alt="Sun* Annual Awards 2025"
      width={52}
      height={48}
      priority
      className={className}
      style={style}
    />
  );
}
