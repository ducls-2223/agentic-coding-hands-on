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
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.profile")}
        aria-expanded={open}
        aria-haspopup="menu"
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
        <div className="absolute right-0 top-12 z-50 flex w-38 flex-col gap-1 rounded-lg border border-[#2E3940] bg-[#101417] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="font-montserrat group flex h-10 items-center justify-between rounded-md px-3 text-sm font-bold text-white transition-colors hover:bg-[#FFEA9E]/15 hover:shadow-[0_0_12px_rgba(255,234,158,0.35)] focus-visible:bg-[#FFEA9E]/15 focus-visible:shadow-[0_0_12px_rgba(255,234,158,0.35)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFEA9E]/60"
          >
            <span>{t("nav.profile")}</span>
            <Image
              src="/home/icon-user.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden
              className="opacity-80 transition-opacity group-hover:opacity-100"
            />
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="font-montserrat group flex h-10 w-full items-center justify-between rounded-md px-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <span>{t("nav.sign_out")}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className="opacity-80 transition-opacity group-hover:opacity-100"
              >
                <path
                  d="M6 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
