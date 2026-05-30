import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabase query builder is thenable + chainable. Single object that:
//   - returns itself from each chain method (so order/limit/ilike compose)
//   - resolves via .then() to the configured { data, error } payload
let nextResult: { data: unknown; error: unknown } = { data: [], error: null };

const builder = {
  select: vi.fn(() => builder),
  order: vi.fn(() => builder),
  limit: vi.fn(() => builder),
  ilike: vi.fn(() => builder),
  then: (onFulfilled: (v: typeof nextResult) => unknown) =>
    Promise.resolve(nextResult).then(onFulfilled),
};

const from = vi.fn(() => builder);

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => Promise.resolve({ from })),
}));

import { searchSunners } from "@/app/sun-kudos/_actions/search-sunners";

const ROWS = [
  { id: "1", name: "Alice", level: "Hero", badge: "B", avatar: null, department: null },
];

describe("searchSunners", () => {
  beforeEach(() => {
    builder.select.mockClear();
    builder.order.mockClear();
    builder.limit.mockClear();
    builder.ilike.mockClear();
    from.mockClear();
    nextResult = { data: [], error: null };
  });

  it("returns the top alphabetical slice when query is empty", async () => {
    nextResult = { data: ROWS, error: null };
    const out = await searchSunners("");
    expect(out).toEqual(ROWS);
    expect(builder.ilike).not.toHaveBeenCalled();
    expect(builder.order).toHaveBeenCalledWith("name", { ascending: true });
  });

  it("applies an ILIKE %query% filter when query is non-empty", async () => {
    nextResult = { data: ROWS, error: null };
    await searchSunners("Al");
    expect(builder.ilike).toHaveBeenCalledWith("name", "%Al%");
  });

  it("escapes ILIKE wildcards in user query", async () => {
    await searchSunners("%_\\");
    const call = builder.ilike.mock.calls[0][1] as string;
    expect(call).toContain("\\%");
    expect(call).toContain("\\_");
    expect(call).toContain("\\\\");
  });

  it("trims whitespace before searching", async () => {
    await searchSunners("  An  ");
    expect(builder.ilike).toHaveBeenCalledWith("name", "%An%");
  });

  it("honors the limit param (default 10)", async () => {
    await searchSunners("");
    expect(builder.limit).toHaveBeenCalledWith(10);
    await searchSunners("", 5);
    expect(builder.limit).toHaveBeenCalledWith(5);
  });

  it("returns [] on error", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    nextResult = { data: null, error: { message: "boom" } };
    const out = await searchSunners("X");
    expect(out).toEqual([]);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
