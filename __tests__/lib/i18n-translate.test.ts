import { describe, it, expect } from "vitest";
import { t } from "@/lib/i18n/t";

describe("t() — translation lookup", () => {
  it("returns the English string for a known key", () => {
    expect(t("en", "nav.profile")).toBe("Profile");
  });

  it("returns the Vietnamese string for a known key", () => {
    expect(t("vi", "nav.profile")).toBe("Hồ sơ");
  });

  it("falls back to the raw key when both dictionaries miss", () => {
    // @ts-expect-error — intentionally passing an unknown key to exercise fallback
    expect(t("en", "this.key.is.not.in.dictionaries")).toBe(
      "this.key.is.not.in.dictionaries",
    );
  });

  it("substitutes {var} placeholders when vars are provided", () => {
    // Use a known time-related key that contains {n}
    const out = t("en", "time.minutes_ago", { n: 5 });
    expect(out).toContain("5");
  });

  it("leaves unknown placeholders intact when vars miss them", () => {
    // Pass a key that has {n} but supply no matching var.
    const out = t("en", "time.minutes_ago", {});
    expect(out).toContain("{n}");
  });
});
