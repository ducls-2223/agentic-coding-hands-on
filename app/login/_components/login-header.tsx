import { LocalizedLink as Link } from "@/app/_components/localized-link";
import SaaLogo from "./saa-logo";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { getLanguage } from "@/lib/i18n/server";

/**
 * Login page header: SAA logo (left) + language switcher (right).
 * Fixed top, full-width, transparent background with subtle blur.
 *
 * Design ref: mms_A_Header (node 662:14391)
 *   Logo:     mms_A.1_Logo  — I662:14391;178:1033;178:1030 (52×56px)
 *   Language: mms_A.2_Language — I662:14391;186:1601
 */
export default async function LoginHeader() {
  const language = await getLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10">
      {/* SAA logo — links to home per clarifications. Asset is 52×48; render at natural aspect. */}
      <Link href="/" aria-label="SAA Home">
        <SaaLogo className="h-12 w-auto" />
      </Link>

      <LanguageSwitcher current={language} />
    </header>
  );
}
