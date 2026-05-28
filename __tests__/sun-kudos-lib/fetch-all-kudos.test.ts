import { describe, it, expect, vi, beforeEach } from "vitest";

type SupabaseLike = {
  from: ReturnType<typeof vi.fn>;
};

const query = {
  select: vi.fn(() => query),
  order: vi.fn(() => query),
  limit: vi.fn(),
};

const supabase: SupabaseLike = {
  from: vi.fn(() => query),
};

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => Promise.resolve(supabase)),
}));

import { fetchAllKudos } from "@/app/sun-kudos/_lib/fetch-all-kudos";

const ROW = {
  id: "k1",
  content: "Great work!",
  created_at: new Date(Date.now() - 5 * 60_000).toISOString(),
  author_name: "Alice",
  author_avatar: "/a.png",
  author_level: "Hero",
  author_badge: "/b.png",
  images: null,
  kudos_recipients: { name: "Bob", level: "Hero", badge: "/b.png", avatar: "/b2.png", department: "ENG" },
  kudos_hashtags: [{ hashtag: "shipit" }],
};

describe("fetchAllKudos", () => {
  beforeEach(() => {
    query.select.mockReset().mockImplementation(() => query);
    query.order.mockReset().mockImplementation(() => query);
    query.limit.mockReset();
    supabase.from.mockReset().mockImplementation(() => query);
  });

  it("maps Supabase rows into KudosItem shape", async () => {
    query.limit.mockResolvedValueOnce({ data: [ROW], error: null });
    const items = await fetchAllKudos("en");

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "k1",
      sender: { name: "Alice", level: "Hero" },
      receiver: { name: "Bob", department: "ENG" },
      message: "Great work!",
      hashtags: ["shipit"],
      likes: 0,
    });
    expect(supabase.from).toHaveBeenCalledWith("kudos");
  });

  it("returns an empty array on query error", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    query.limit.mockResolvedValueOnce({ data: null, error: { code: "E", message: "boom" } });

    const items = await fetchAllKudos("en");

    expect(items).toEqual([]);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it("skips rows whose recipient is null", async () => {
    query.limit.mockResolvedValueOnce({
      data: [{ ...ROW, id: "k2", kudos_recipients: null }],
      error: null,
    });

    const items = await fetchAllKudos("en");
    expect(items).toEqual([]);
  });

  it("returns [] when data is null", async () => {
    query.limit.mockResolvedValueOnce({ data: null, error: null });
    const items = await fetchAllKudos("en");
    expect(items).toEqual([]);
  });

  it("applies fallback values when row fields are null", async () => {
    query.limit.mockResolvedValueOnce({
      data: [
        {
          ...ROW,
          author_name: null,
          author_avatar: null,
          author_level: null,
          author_badge: null,
          images: null,
          kudos_hashtags: null,
          kudos_recipients: {
            name: "Bob",
            level: "Hero",
            badge: "/b.png",
            avatar: null,
            department: null,
          },
        },
      ],
      error: null,
    });

    const items = await fetchAllKudos("en");
    expect(items).toHaveLength(1);
    expect(items[0].sender.name).toBe("Sunner");
    expect(items[0].sender.avatar).toBe("/kudos/avatars/sender.png");
    expect(items[0].receiver.avatar).toBe("/kudos/avatars/sender.png");
    expect(items[0].receiver.department).toBeUndefined();
    expect(items[0].hashtags).toEqual([]);
    expect(items[0].images).toBeUndefined();
  });

  it("unwraps a single-object recipient (Supabase !inner shape)", async () => {
    query.limit.mockResolvedValueOnce({
      data: [
        {
          ...ROW,
          kudos_recipients: [
            { name: "Carol", level: "Hero", badge: "/b.png", avatar: "/c.png", department: "ENG" },
          ],
        },
      ],
      error: null,
    });

    const items = await fetchAllKudos("en");
    expect(items[0].receiver.name).toBe("Carol");
  });

  it("returns [] when the recipient array is empty", async () => {
    query.limit.mockResolvedValueOnce({
      data: [{ ...ROW, kudos_recipients: [] }],
      error: null,
    });

    const items = await fetchAllKudos("en");
    expect(items).toEqual([]);
  });
});
