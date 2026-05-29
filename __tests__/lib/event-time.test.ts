import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveEventStartMs } from "@/lib/event-time";

const ENV_KEY = "NEXT_PUBLIC_EVENT_START_DATETIME";
const FALLBACK_MS = new Date("2025-12-31T18:30:00+07:00").getTime();

describe("resolveEventStartMs", () => {
  const original = process.env[ENV_KEY];

  beforeEach(() => {
    delete process.env[ENV_KEY];
  });

  afterEach(() => {
    if (original === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = original;
  });

  it("returns the fallback ISO timestamp when env var is unset", () => {
    expect(resolveEventStartMs()).toBe(FALLBACK_MS);
  });

  it("parses a valid ISO string from the env var", () => {
    process.env[ENV_KEY] = "2026-06-01T09:00:00+07:00";
    expect(resolveEventStartMs()).toBe(
      new Date("2026-06-01T09:00:00+07:00").getTime(),
    );
  });

  it("falls back when env var contains an unparseable string", () => {
    process.env[ENV_KEY] = "not-a-date";
    expect(resolveEventStartMs()).toBe(FALLBACK_MS);
  });
});
