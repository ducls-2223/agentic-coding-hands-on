import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "@/app/sun-kudos/_lib/format-relative-time";

const NOW = new Date("2026-05-28T10:00:00Z");

describe("formatRelativeTime", () => {
  it("uses 'just_now' for diffs under a minute", () => {
    const out = formatRelativeTime("2026-05-28T09:59:30Z", "en", NOW);
    expect(out).toMatch(/just|now/i);
  });

  it("returns minutes_ago with the right count under an hour", () => {
    const out = formatRelativeTime("2026-05-28T09:55:00Z", "en", NOW);
    expect(out).toContain("5");
  });

  it("returns hours_ago with the right count under a day", () => {
    const out = formatRelativeTime("2026-05-28T07:00:00Z", "en", NOW);
    expect(out).toContain("3");
  });

  it("returns days_ago beyond 24 hours", () => {
    const out = formatRelativeTime("2026-05-26T10:00:00Z", "en", NOW);
    expect(out).toContain("2");
  });

  it("treats a future timestamp as 0 (just_now)", () => {
    const future = new Date(NOW.getTime() + 60_000).toISOString();
    const out = formatRelativeTime(future, "en", NOW);
    expect(out).toMatch(/just|now/i);
  });

  it("accepts a Date instance as well as a string", () => {
    const dateInput = new Date("2026-05-28T09:50:00Z");
    const out = formatRelativeTime(dateInput, "en", NOW);
    expect(out).toContain("10");
  });
});
