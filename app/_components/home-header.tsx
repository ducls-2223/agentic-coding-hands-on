import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import { UserMenu } from "./user-menu";
import { signOut } from "@/app/(home)/_actions/sign-out";

interface HomeHeaderProps {
  user: User | null;
  /** Pathname of the current route; used to highlight the active nav link. */
  activePath?: string;
}

const NAV_LINKS = [
  { label: "About SAA 2025", href: "/" },
  { label: "Awards Information", href: "/awards-information" },
  { label: "Sun* Kudos", href: "/sun-kudos" },
];

export function HomeHeader({ user, activePath = "/" }: HomeHeaderProps) {
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
        {/* Language switcher */}
        <button className="flex h-14 w-[108px] items-center justify-between gap-1 rounded px-4 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors">
          <span className="flex items-center gap-1">
            <Image src="/home/vn-flag.svg" alt="VN" width={20} height={15} />
            <span className="font-montserrat ml-1">VN</span>
          </span>
          <Image
            src="/login/chevron-down.svg"
            alt=""
            width={24}
            height={24}
          />
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded hover:bg-white/10 transition-colors"
          >
            <Image
              src="/home/icon-notification.svg"
              alt="Notifications"
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
