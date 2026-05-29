import { describe, it, expect, vi, beforeEach } from "vitest";

const getUser = vi.fn();
const sunnerSelect = vi.fn();
const kudosInsert = vi.fn();
const recipientInsert = vi.fn();
const hashtagInsert = vi.fn();

// Light query-builder mock matching the call shapes used by createKudos.
function makeBuilder() {
  return {
    auth: { getUser },
    from: vi.fn((table: string) => {
      if (table === "sunners") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({ maybeSingle: () => sunnerSelect() })),
          })),
        };
      }
      if (table === "kudos") {
        return {
          insert: (...args: unknown[]) => ({
            select: vi.fn(() => ({ single: () => kudosInsert(...args) })),
          }),
        };
      }
      if (table === "kudos_recipients") {
        return { insert: (...args: unknown[]) => recipientInsert(...args) };
      }
      if (table === "kudos_hashtags") {
        return { insert: (...args: unknown[]) => hashtagInsert(...args) };
      }
      return {};
    }),
  };
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => Promise.resolve(makeBuilder())),
}));
vi.mock("@/lib/supabase/env", () => ({
  getSupabaseEnv: () => ({ url: "http://localhost:54321", publishableKey: "k" }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createKudos } from "@/app/sun-kudos/_actions/create-kudos";

const VALID_RECIPIENT = "00000000-0000-0000-0000-000000000001";
const SUNNER_ROW = {
  id: VALID_RECIPIENT,
  name: "Alice",
  level: "Hero",
  badge: "/b.png",
  avatar: "/a.png",
  department: "ENG",
};

function fd(overrides: Record<string, string> = {}): FormData {
  const f = new FormData();
  f.set("content", "<p>Thanks!</p>");
  f.set("recipient_id", VALID_RECIPIENT);
  f.set("hashtags", JSON.stringify(["#shipit"]));
  for (const [k, v] of Object.entries(overrides)) f.set(k, v);
  return f;
}

describe("createKudos action (new API)", () => {
  beforeEach(() => {
    getUser.mockReset().mockResolvedValue({
      data: { user: { id: "u1", email: "x@y.z" } },
      error: null,
    });
    sunnerSelect.mockReset().mockResolvedValue({ data: SUNNER_ROW, error: null });
    kudosInsert.mockReset().mockResolvedValue({ data: { id: "k1" }, error: null });
    recipientInsert.mockReset().mockResolvedValue({ error: null });
    hashtagInsert.mockReset().mockResolvedValue({ error: null });
  });

  it("returns field-level error when content is empty after sanitization", async () => {
    const res = await createKudos(null, fd({ content: "" }));
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.content).toBeTruthy();
  });

  it("returns field-level error when recipient_id is missing", async () => {
    const f = fd();
    f.delete("recipient_id");
    const res = await createKudos(null, f);
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.recipient_id).toBeTruthy();
  });

  it("returns field-level error when recipient_id is not a UUID", async () => {
    const res = await createKudos(null, fd({ recipient_id: "not-a-uuid" }));
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.recipient_id).toBeTruthy();
  });

  it("returns field-level error when hashtags JSON is empty", async () => {
    const res = await createKudos(null, fd({ hashtags: "[]" }));
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.hashtags).toBeTruthy();
  });

  it("returns field-level error when more than 5 hashtags", async () => {
    const res = await createKudos(
      null,
      fd({ hashtags: JSON.stringify(["#a", "#b", "#c", "#d", "#e", "#f"]) }),
    );
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.hashtags).toBeTruthy();
  });

  it("requires anonymous_name when is_anonymous=true", async () => {
    const res = await createKudos(null, fd({ is_anonymous: "true" }));
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.anonymous_name).toBeTruthy();
  });

  it("rejects image URLs that don't match the kudos-images public prefix", async () => {
    const res = await createKudos(
      null,
      fd({ images: JSON.stringify(["https://evil.example.com/x.png"]) }),
    );
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.images).toBeTruthy();
  });

  it("returns auth error when no user is signed in", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const res = await createKudos(null, fd());
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/đăng nhập/i);
  });

  it("returns field error when recipient does not exist", async () => {
    sunnerSelect.mockResolvedValueOnce({ data: null, error: null });
    const res = await createKudos(null, fd());
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.recipient_id).toBeTruthy();
  });

  it("inserts kudos + recipient + hashtag rows on success", async () => {
    const res = await createKudos(null, fd());
    expect(res.ok).toBe(true);
    expect(kudosInsert).toHaveBeenCalledTimes(1);
    expect(recipientInsert).toHaveBeenCalledTimes(1);
    expect(hashtagInsert).toHaveBeenCalledTimes(1);
  });

  it("dedupes hashtags case-insensitively", async () => {
    await createKudos(
      null,
      fd({ hashtags: JSON.stringify(["#TeamWork", "#teamwork"]) }),
    );
    const inserted = hashtagInsert.mock.calls[0][0] as Array<{ hashtag: string }>;
    expect(inserted).toHaveLength(1);
  });

  it("returns top-level error when kudos insert fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    kudosInsert.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const res = await createKudos(null, fd());
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
    errSpy.mockRestore();
  });

<<<<<<< HEAD
  it("returns error when getUser fails", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "x" },
    });
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await createKudos(null, fd("hi"));
=======
  it("rejects when content type is not a string", async () => {
    const f = fd();
    f.delete("content");
    // FormData.get returns null when key missing → action's typeof check returns false.
    const res = await createKudos(null, f);
>>>>>>> 9af2d3d (test(app): restore + extend vitest suite to >=90% coverage)
    expect(res.ok).toBe(false);
  });

  it("rejects when the sunner lookup itself errors", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sunnerSelect.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const res = await createKudos(null, fd());
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/người nhận/i);
    errSpy.mockRestore();
  });

  it("returns auth error when getUser itself errors", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getUser.mockResolvedValueOnce({ data: { user: null }, error: { message: "x" } });
    const res = await createKudos(null, fd());
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/phiên/i);
    errSpy.mockRestore();
  });

<<<<<<< HEAD
    const res = await createKudos(null, fd("Thanks!"));
    expect(res).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({
      author_id: "u1",
      content: "Thanks!",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/sun-kudos");
=======
  it("returns field error when hashtag has invalid (whitespace-only) value", async () => {
    const res = await createKudos(null, fd({ hashtags: JSON.stringify(["   "]) }));
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.hashtags).toBeTruthy();
  });

  it("rejects images array of length > 5", async () => {
    const tooMany = Array.from({ length: 6 }, (_, i) =>
      `http://localhost:54321/storage/v1/object/public/kudos-images/${i}.jpg`,
    );
    const res = await createKudos(null, fd({ images: JSON.stringify(tooMany) }));
    expect(res.ok).toBe(false);
    expect(res.fieldErrors?.images).toBeTruthy();
  });

  it("accepts a valid images array that matches the bucket prefix", async () => {
    const valid = [
      "http://localhost:54321/storage/v1/object/public/kudos-images/a.jpg",
    ];
    const res = await createKudos(null, fd({ images: JSON.stringify(valid) }));
    expect(res.ok).toBe(true);
>>>>>>> 9af2d3d (test(app): restore + extend vitest suite to >=90% coverage)
  });
});
