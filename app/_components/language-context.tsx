"use client";

import { createContext, useContext, type ReactNode } from "react";

import { DEFAULT_LANGUAGE, type Language } from "@/lib/i18n";

const LanguageContext = createContext<Language>(DEFAULT_LANGUAGE);

interface LanguageProviderProps {
  value: Language;
  children: ReactNode;
}

export function LanguageProvider({ value, children }: LanguageProviderProps) {
  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

/** Read the active language. Seeded server-side from the URL `?lang=` param. */
export function useLanguage(): Language {
  return useContext(LanguageContext);
}
