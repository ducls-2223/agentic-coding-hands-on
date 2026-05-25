import Link from "next/link";
import SaaLogo from "./saa-logo";

/**
 * Login page header: SAA logo (left) + language switcher "VN" with flag + chevron (right).
 * Fixed top, full-width, transparent background with subtle blur.
 *
 * Design ref: mms_A_Header (node 662:14391)
 *   Logo:     mms_A.1_Logo  — I662:14391;178:1033;178:1030
 *   Language: mms_A.2_Language — I662:14391;186:1601
 */
export default function LoginHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
      {/* SAA logo — links to home per clarifications */}
      <Link href="/" aria-label="SAA Home">
        <SaaLogo className="h-12 w-auto" />
      </Link>

      {/* Language switcher — static display only, no dropdown (per clarifications) */}
      <button
        type="button"
        aria-disabled="true"
        aria-label="Switch language — currently Vietnamese (disabled)"
        className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
      >
        {/* Vietnamese flag */}
        <span aria-hidden="true" className="text-base leading-none">
          🇻🇳
        </span>
        <span className="text-sm font-semibold tracking-wide">VN</span>
        {/* Chevron down */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className="ml-0.5"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </header>
  );
}
