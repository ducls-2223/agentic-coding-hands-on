import { describe, it, expect, vi, beforeEach } from "vitest";

const limit = vi.fn();
const order = vi.fn(() => ({ limit }));
const select = vi.fn(() => ({ order }));
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => Promise.resolve({ from })),
}));

import { fetchSunners } from "@/app/sun-kudos/_lib/fetch-sunners";

describe("fetchSunners", () => {
  beforeEach(() => {
    limit.mockReset();
    order.mockClear();
    select.mockClear();
    from.mockClear();
  });

  it("returns the rows from the sunners table ordered by name", async () => {
    const rows = [
      { id: "1", name: "Alice", level: "Hero", badge: "B", avatar: null, department: null },
      { id: "2", name: "Bob", level: "Hero", badge: "B", avatar: null, department: null },
    ];
    limit.mockResolvedValueOnce({ data: rows, error: null });

    const out = await fetchSunners();
    expect(out).toEqual(rows);
    expect(from).toHaveBeenCalledWith("sunners");
    expect(order).toHaveBeenCalledWith("name", { ascending: true });
  });

  it("honors the optional limit param", async () => {
    limit.mockResolvedValueOnce({ data: [], error: null });
    await fetchSunners(25);
    expect(limit).toHaveBeenCalledWith(25);
  });

  it("defaults limit to 100", async () => {
    limit.mockResolvedValueOnce({ data: [], error: null });
    await fetchSunners();
    expect(limit).toHaveBeenCalledWith(100);
  });

  it("returns [] when supabase returns an error", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    limit.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

    const out = await fetchSunners();
    expect(out).toEqual([]);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it("returns [] when supabase returns null data", async () => {
    limit.mockResolvedValueOnce({ data: null, error: null });
    const out = await fetchSunners();
    expect(out).toEqual([]);
  });
});
