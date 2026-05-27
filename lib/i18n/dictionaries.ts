import type { Language } from "../i18n";
import { EN } from "./dictionaries/en";
import { VI, type ViDictionary } from "./dictionaries/vi";

export type TranslationKey = keyof ViDictionary;

export const DICTIONARIES: Record<Language, Partial<Record<TranslationKey, string>>> = {
  vi: VI,
  en: EN,
};
