import type { Language } from "../i18n";
import { DICTIONARIES } from "./dictionaries";

/**
 * Translate `key` for `lang`. Falls back to the `vi` (default) dictionary,
 * then to the raw key. Returns the key itself when nothing is mapped — so
 * untranslated UI surfaces visibly rather than rendering blank.
 */
export function t(lang: Language, key: string): string {
  return DICTIONARIES[lang][key] ?? DICTIONARIES.vi[key] ?? key;
}
