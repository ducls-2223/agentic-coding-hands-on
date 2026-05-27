import type { Language } from "../i18n";
import { DICTIONARIES, type TranslationKey } from "./dictionaries";

type Vars = Record<string, string | number>;

/**
 * Translate `key` for `lang`. Falls back through `vi` → raw key so untranslated
 * UI surfaces visibly. Supports `{name}` placeholders via the `vars` argument.
 */
export function t(lang: Language, key: TranslationKey, vars?: Vars): string {
  const template =
    DICTIONARIES[lang][key] ?? DICTIONARIES.vi[key] ?? (key as string);
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}
