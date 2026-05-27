"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { LocalizedLink as Link } from "./localized-link";
import type { User } from "@supabase/supabase-js";
import { useTranslation } from "./use-translation";

interface UserMenuProps {
  user: User | null;
  signOutAction: () => Promise<void>;
}

export function UserMenu({ user, signOutAction }: UserMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? "Guest";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.profile")}
        className="flex h-10 w-10 items-center justify-center rounded border border-[#998C5F] hover:bg-white/10 transition-colors"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={24}
            height={24}
            className="rounded-full object-cover"
          />
        ) : (
          <Image
            src="/home/icon-user.svg"
            alt="User"
            width={24}
            height={24}
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-48 rounded border border-[#2E3940] bg-[#101417] py-1 shadow-lg">
          <div className="border-b border-[#2E3940] px-4 py-2 text-xs text-gray-400 truncate">
            {displayName}
          </div>
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(false)}
          >
            {t("nav.profile")}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
            >
              {t("nav.sign_out")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
