import Image from "next/image";
import { LocalizedLink as Link } from "./localized-link";
import type { User } from "@supabase/supabase-js";

import { UserMenu } from "./user-menu";
import { LanguageSwitcher } from "./language-switcher";
import { signOut } from "@/app/(home)/_actions/sign-out";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

interface HomeHeaderProps {
  user: User | null;
  /** Pathname of the current route; used to highlight the active nav link. */
  activePath?: string;
}

export async function HomeHeader({ user, activePath = "/" }: HomeHeaderProps) {
  const language = await getLanguage();

  const NAV_LINKS = [
    { label: t(language, "nav.about_saa"), href: "/" },
    { label: t(language, "nav.awards_information"), href: "/awards-information" },
    { label: t(language, "nav.sun_kudos"), href: "/sun-kudos" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between bg-[rgba(16,20,23,0.80)] px-[144px] backdrop-blur-sm">
      {/* Left: logo + nav */}
      <div className="flex items-center gap-16">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/login/logo-saa.png"
            alt="SAA Logo"
            width={52}
            height={48}
            priority
          />
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const active = link.href === activePath;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "font-montserrat flex items-center gap-1 border-b border-[#FFEA9E] px-4 py-4 text-base font-bold text-[#FFEA9E]"
                    : "font-montserrat flex items-center gap-1 rounded px-4 py-4 text-base font-bold text-white transition-colors hover:bg-white/10"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: language + notification + user */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher current={language} />

        {/* Notification bell */}
        <div className="relative">
          <button
            aria-label={t(language, "nav.notifications")}
            className="flex h-10 w-10 items-center justify-center rounded hover:bg-white/10 transition-colors"
          >
            <Image
              src="/home/icon-notification.svg"
              alt={t(language, "nav.notifications")}
              width={24}
              height={24}
            />
          </button>
          {/* Red notification dot */}
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#D4271D]" />
        </div>

        {/* User menu */}
        <UserMenu user={user} signOutAction={signOut} />
      </div>
    </header>
  );
}
