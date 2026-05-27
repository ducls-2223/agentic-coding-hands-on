import "server-only";

import { headers } from "next/headers";

import { DEFAULT_LANGUAGE, isLanguage, type Language } from "../i18n";

/**
 * Read the active language on the server. Source of truth is the URL
 * `?lang=` query param, injected by `proxy.ts` as the `x-lang` header.
 * Falls back to `DEFAULT_LANGUAGE` when missing or invalid.
 */
export async function getLanguage(): Promise<Language> {
  const headerList = await headers();
  const raw = headerList.get("x-lang");
  return isLanguage(raw) ? raw : DEFAULT_LANGUAGE;
}
