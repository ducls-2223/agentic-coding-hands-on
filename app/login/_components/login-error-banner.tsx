/**
 * Error banner rendered when ?error=<code> is present in searchParams.
 * Maps known OAuth error codes to Vietnamese user-friendly messages.
 *
 * Design ref: inline banner above the Google login button (per clarifications)
 */

import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";
import type { TranslationKey } from "@/lib/i18n/dictionaries";

/** Maps known OAuth error codes to translation keys */
const ERROR_KEY_MAP: Record<string, TranslationKey> = {
  oauth_init_failed: "login.error.generic",
  oauth_exchange_failed: "login.error.oauth_failed",
  oauth_missing_code: "login.error.generic",
};

function getErrorKey(code: string): TranslationKey {
  return ERROR_KEY_MAP[code] ?? "login.error.generic";
}

interface LoginErrorBannerProps {
  errorCode: string;
}

export default async function LoginErrorBanner({ errorCode }: LoginErrorBannerProps) {
  const lang = await getLanguage();
  const message = t(lang, getErrorKey(errorCode));

  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2.5 text-sm text-white shadow-md backdrop-blur-sm"
    >
      {/* Warning icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M8 1.5L14.928 13.5H1.072L8 1.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8 6.5V9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11" r="0.75" fill="currentColor" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
