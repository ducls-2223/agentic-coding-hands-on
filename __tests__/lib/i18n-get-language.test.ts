import { describe, it, expect, vi, beforeEach } from "vitest";

const getHeader = vi.fn();
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve({ get: getHeader })),
}));

import { getLanguage } from "@/lib/i18n/server";

describe("getLanguage", () => {
  beforeEach(() => getHeader.mockReset());

  it("returns the x-lang value when it's a valid Language", async () => {
    getHeader.mockReturnValue("en");
    await expect(getLanguage()).resolves.toBe("en");
    expect(getHeader).toHaveBeenCalledWith("x-lang");
  });

  it("falls back to the default language when x-lang is missing", async () => {
    getHeader.mockReturnValue(null);
    await expect(getLanguage()).resolves.toBe("vi");
  });

  it("falls back to the default language when x-lang is unknown", async () => {
    getHeader.mockReturnValue("fr");
    await expect(getLanguage()).resolves.toBe("vi");
  });
});
