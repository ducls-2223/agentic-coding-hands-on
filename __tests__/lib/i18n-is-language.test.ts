import { describe, it, expect } from "vitest";
import { isLanguage, LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/i18n";

describe("isLanguage", () => {
  it("returns true for every supported language", () => {
    for (const lang of LANGUAGES) {
      expect(isLanguage(lang)).toBe(true);
    }
  });

  it("returns false for unknown strings", () => {
    expect(isLanguage("fr")).toBe(false);
    expect(isLanguage("EN")).toBe(false);
    expect(isLanguage("")).toBe(false);
  });

  it("returns false for non-string inputs", () => {
    expect(isLanguage(null)).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
    expect(isLanguage(123)).toBe(false);
    expect(isLanguage({})).toBe(false);
  });

  it("declares 'vi' as the default language", () => {
    expect(DEFAULT_LANGUAGE).toBe("vi");
  });
});
