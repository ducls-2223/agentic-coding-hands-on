import { describe, it, expect, vi, beforeEach } from "vitest";

const signOutMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() =>
    Promise.resolve({ auth: { signOut: signOutMock } }),
  ),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error(`NEXT_REDIRECT;${url}`);
    (err as Error & { digest?: string }).digest = `NEXT_REDIRECT;${url}`;
    throw err;
  }),
}));

import { signOut } from "@/app/(home)/_actions/sign-out";
import { redirect } from "next/navigation";

describe("signOut action", () => {
  beforeEach(() => {
    signOutMock.mockReset().mockResolvedValue({ error: null });
    vi.mocked(redirect).mockClear();
  });

  it("signs the user out then redirects to /login", async () => {
    await expect(signOut()).rejects.toThrow(/NEXT_REDIRECT;\/login/);
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
