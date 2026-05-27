"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useContext, type ReactNode } from "react";

import {
  DEFAULT_LANGUAGE,
  isLanguage,
  LANGUAGE_PARAM,
  type Language,
} from "@/lib/i18n";

const LanguageContext = createContext<Language>(DEFAULT_LANGUAGE);

interface LanguageProviderProps {
  /**
   * Initial language as resolved server-side from the URL `?lang=` param.
   * Used only when client search params are not yet available (SSR / before
   * Suspense resolves). Once the client hook runs, the URL is the source of
   * truth — this keeps the provider in sync with `router.push()` mutations
   * that don't re-render the root layout.
   */
  initial: Language;
  children: ReactNode;
}

export function LanguageProvider({ initial, children }: LanguageProviderProps) {
  // Read directly from the URL on every render so the provider stays in sync
  // with router.push() updates. The root layout is cached across intra-route
  // navigations, so a static `value` prop would go stale immediately.
  const searchParams = useSearchParams();
  const raw = searchParams?.get(LANGUAGE_PARAM);
  const value: Language = isLanguage(raw) ? raw : initial;

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Read the active language. Live-tracks the URL `?lang=` value. */
export function useLanguage(): Language {
  return useContext(LanguageContext);
}
