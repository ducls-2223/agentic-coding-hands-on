import type { Language } from "../i18n";

// Scaffold dictionaries. Empty by design — strings live in JSX today; future
// callers can populate these maps to localize specific keys without touching
// the i18n machinery itself.
type Dictionary = Record<string, string>;

export const DICTIONARIES: Record<Language, Dictionary> = {
  vi: {},
  en: {},
};
