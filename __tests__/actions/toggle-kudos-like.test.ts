import { describe, it, expect, vi, beforeEach } from "vitest";

const getUser = vi.fn();
const selectExisting = vi.fn();
const insertLike = vi.fn();
const deleteLike = vi.fn();
const selectCount = vi.fn();

function makeBuilder() {
  return {
    auth: { getUser },
    from: vi.fn((table: string) => {
      if (table === "kudos_likes") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({ maybeSingle: () => selectExisting() })),
            })),
          })),
          insert: (...args: unknown[]) => insertLike(...args),
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => deleteLike()),
            })),
          })),
        };
      }
      if (table === "kudos") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle: () => selectCount() })),
          })),
        };
      }
      return {};
    }),
  };
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => Promise.resolve(makeBuilder())),
}));

import { toggleKudosLike } from "@/app/sun-kudos/_actions/toggle-kudos-like";

const VALID_ID = "11111111-1111-1111-1111-111111111111";

describe("toggleKudosLike", () => {
  beforeEach(() => {
    getUser.mockReset().mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    selectExisting.mockReset();
    insertLike.mockReset().mockResolvedValue({ error: null });
    deleteLike.mockReset().mockResolvedValue({ error: null });
    selectCount.mockReset().mockResolvedValue({ data: { likes_count: 0 }, error: null });
  });

  it("rejects a malformed UUID", async () => {
    const res = await toggleKudosLike("not-a-uuid");
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
  });

  it("rejects when no user is signed in", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const res = await toggleKudosLike(VALID_ID);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/đăng nhập/i);
  });

  it("inserts a like row when none exists and returns liked=true", async () => {
    selectExisting.mockResolvedValueOnce({ data: null, error: null });
    selectCount.mockResolvedValueOnce({ data: { likes_count: 1 }, error: null });
    const res = await toggleKudosLike(VALID_ID);
    expect(res.ok).toBe(true);
    expect(res.liked).toBe(true);
    expect(res.count).toBe(1);
    expect(insertLike).toHaveBeenCalled();
    expect(deleteLike).not.toHaveBeenCalled();
  });

  it("deletes the like row when one exists and returns liked=false", async () => {
    selectExisting.mockResolvedValueOnce({
      data: { kudos_id: VALID_ID },
      error: null,
    });
    selectCount.mockResolvedValueOnce({ data: { likes_count: 0 }, error: null });
    const res = await toggleKudosLike(VALID_ID);
    expect(res.ok).toBe(true);
    expect(res.liked).toBe(false);
    expect(res.count).toBe(0);
    expect(deleteLike).toHaveBeenCalled();
    expect(insertLike).not.toHaveBeenCalled();
  });

  it("treats 23505 unique_violation on insert as a benign race (liked=true)", async () => {
    selectExisting.mockResolvedValueOnce({ data: null, error: null });
    insertLike.mockResolvedValueOnce({ error: { code: "23505", message: "duplicate" } });
    selectCount.mockResolvedValueOnce({ data: { likes_count: 1 }, error: null });
    const res = await toggleKudosLike(VALID_ID);
    expect(res.ok).toBe(true);
    expect(res.liked).toBe(true);
  });

  it("returns ok=false when insert fails with a non-23505 error", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    selectExisting.mockResolvedValueOnce({ data: null, error: null });
    insertLike.mockResolvedValueOnce({ error: { code: "XX000", message: "boom" } });
    const res = await toggleKudosLike(VALID_ID);
    expect(res.ok).toBe(false);
    errSpy.mockRestore();
  });

  it("returns ok=true without count when the post-toggle SELECT fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    selectExisting.mockResolvedValueOnce({ data: null, error: null });
    selectCount.mockResolvedValueOnce({ data: null, error: { message: "x" } });
    const res = await toggleKudosLike(VALID_ID);
    expect(res.ok).toBe(true);
    expect(res.liked).toBe(true);
    expect(res.count).toBeUndefined();
    errSpy.mockRestore();
  });

  it("returns ok=false when getUser itself errors", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getUser.mockResolvedValueOnce({ data: { user: null }, error: { message: "x" } });
    const res = await toggleKudosLike(VALID_ID);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/Phiên đăng nhập/);
    errSpy.mockRestore();
  });

  it("returns ok=false when the existing-like SELECT errors", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    selectExisting.mockResolvedValueOnce({ data: null, error: { message: "x" } });
    const res = await toggleKudosLike(VALID_ID);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/trạng thái/);
    errSpy.mockRestore();
  });

  it("returns ok=false when DELETE errors during unlike", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    selectExisting.mockResolvedValueOnce({
      data: { kudos_id: VALID_ID },
      error: null,
    });
    deleteLike.mockResolvedValueOnce({ error: { message: "boom" } });
    const res = await toggleKudosLike(VALID_ID);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/bỏ thích/);
    errSpy.mockRestore();
  });
});
