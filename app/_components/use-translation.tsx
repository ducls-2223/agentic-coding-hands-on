"use client";

import { useCallback } from "react";

import { t as translate } from "@/lib/i18n/t";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import { useLanguage } from "./language-context";

/**
 * Client-side translation hook. Reads the active language from
 * `<LanguageProvider>` (seeded server-side from the `?lang=` URL param) and
 * returns a `t(key, vars?)` closure. Server components can call
 * `t(lang, key, vars?)` directly from `lib/i18n/t.ts`.
 */
export function useTranslation() {
  const lang = useLanguage();
  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    [lang],
  );
  return { t, lang };
}
