import Image from "next/image";
import Link from "next/link";
import SaaLogo from "./saa-logo";

/**
 * Login page header: SAA logo (left) + language switcher "VN" with flag + chevron (right).
 * Fixed top, full-width, transparent background with subtle blur.
 *
 * Design ref: mms_A_Header (node 662:14391)
 *   Logo:     mms_A.1_Logo  — I662:14391;178:1033;178:1030 (52×56px)
 *   Language: mms_A.2_Language — I662:14391;186:1601
 *   Flag: /login/vn-flag.svg (24×24), chevron: /login/chevron-down.svg (24×24)
 */
export default function LoginHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
      {/* SAA logo — links to home per clarifications. Asset is 52×48; render at natural aspect. */}
      <Link href="/" aria-label="SAA Home">
        <SaaLogo className="h-12 w-auto" />
      </Link>

      {/* Language switcher — static display only, no dropdown (per clarifications) */}
      <button
        type="button"
        aria-disabled="true"
        tabIndex={-1}
        aria-label="Switch language — currently Vietnamese (disabled)"
        className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
      >
        {/* Vietnamese flag — /login/vn-flag.svg replaces 🇻🇳 emoji. Decorative;
            the "VN" label and aria-label carry the meaning. */}
        <Image
          src="/login/vn-flag.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
          className="shrink-0"
        />
        <span className="text-sm font-semibold tracking-wide">VN</span>
        {/* Chevron down — /login/chevron-down.svg replaces inline SVG */}
        <Image
          src="/login/chevron-down.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
          className="ml-0.5 shrink-0"
        />
      </button>
    </header>
  );
}
