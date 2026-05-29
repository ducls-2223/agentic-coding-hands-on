import { describe, it, expect, vi } from "vitest";

const cookieGetAll = vi.fn(() => [{ name: "a", value: "1" }]);
const cookieSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      getAll: cookieGetAll,
      set: cookieSet,
    }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((url: string, key: string, opts: unknown) => ({
    url,
    key,
    opts,
  })),
}));

vi.mock("@/lib/supabase/env", () => ({
  getSupabaseEnv: () => ({ url: "http://x", publishableKey: "anon" }),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

describe("createSupabaseServerClient", () => {
  it("constructs a server client with the env URL + publishable key", async () => {
    await createSupabaseServerClient();
    expect(createServerClient).toHaveBeenCalledWith(
      "http://x",
      "anon",
      expect.objectContaining({ cookies: expect.any(Object) }),
    );
  });

  it("getAll forwards to cookieStore.getAll()", async () => {
    await createSupabaseServerClient();
    const call = vi.mocked(createServerClient).mock.calls.at(-1)!;
    const opts = call[2] as { cookies: { getAll: () => unknown[] } };
    const result = opts.cookies.getAll();
    expect(cookieGetAll).toHaveBeenCalled();
    expect(result).toEqual([{ name: "a", value: "1" }]);
  });

  it("setAll forwards each (name, value, options) to cookieStore.set", async () => {
    await createSupabaseServerClient();
    const call = vi.mocked(createServerClient).mock.calls.at(-1)!;
    const opts = call[2] as {
      cookies: { setAll: (cs: Array<{ name: string; value: string; options: unknown }>) => void };
    };
    opts.cookies.setAll([
      { name: "x", value: "1", options: { path: "/" } },
      { name: "y", value: "2", options: { path: "/" } },
    ]);
    expect(cookieSet).toHaveBeenCalledTimes(2);
    expect(cookieSet).toHaveBeenCalledWith("x", "1", { path: "/" });
    expect(cookieSet).toHaveBeenCalledWith("y", "2", { path: "/" });
  });

  it("setAll silently absorbs the read-only-cookies throw (Server Component path)", async () => {
    await createSupabaseServerClient();
    const call = vi.mocked(createServerClient).mock.calls.at(-1)!;
    const opts = call[2] as {
      cookies: { setAll: (cs: Array<{ name: string; value: string; options: unknown }>) => void };
    };
    cookieSet.mockImplementationOnce(() => {
      throw new Error("Cookies can only be modified in a Server Action");
    });
    // Should not throw; the try/catch wraps the setAll loop.
    expect(() =>
      opts.cookies.setAll([{ name: "x", value: "1", options: {} }]),
    ).not.toThrow();
  });
});
