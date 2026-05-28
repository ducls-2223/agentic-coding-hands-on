import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const signInWithOAuth = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() =>
    Promise.resolve({ auth: { signInWithOAuth } }),
  ),
}));
const headerGet = vi.fn();
vi.mock("next/headers", () => ({
  headers: () => Promise.resolve({ get: headerGet }),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error(`NEXT_REDIRECT;${url}`);
    throw err;
  }),
}));

import { loginWithGoogle } from "@/app/login/actions";
import { redirect } from "next/navigation";

describe("loginWithGoogle action", () => {
  const originalSiteUrl = process.env.SITE_URL;

  beforeEach(() => {
    signInWithOAuth.mockReset();
    headerGet.mockReset();
    vi.mocked(redirect).mockClear();
    delete process.env.SITE_URL;
  });

  afterEach(() => {
    if (originalSiteUrl === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = originalSiteUrl;
  });

  it("redirects to the OAuth URL on success", async () => {
    headerGet.mockReturnValue("example.com");
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://accounts.google.com/o/oauth2/auth?..." },
      error: null,
    });

    await expect(loginWithGoogle()).rejects.toThrow(/NEXT_REDIRECT/);
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "https://example.com/auth/callback" },
    });
    expect(redirect).toHaveBeenCalledWith(
      "https://accounts.google.com/o/oauth2/auth?...",
    );
  });

  it("uses SITE_URL env when set", async () => {
    process.env.SITE_URL = "https://saa.local";
    headerGet.mockReturnValue("ignored");
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://oauth/url" },
      error: null,
    });

    await expect(loginWithGoogle()).rejects.toThrow(/NEXT_REDIRECT/);
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "https://saa.local/auth/callback" },
    });
  });

  it("redirects to /login?error=... when OAuth init fails", async () => {
    headerGet.mockReturnValue("example.com");
    signInWithOAuth.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });

    await expect(loginWithGoogle()).rejects.toThrow(/NEXT_REDIRECT/);
    expect(redirect).toHaveBeenCalledWith("/login?error=oauth_init_failed");
  });

  it("falls back to http for localhost host", async () => {
    headerGet.mockReturnValue("localhost:3000");
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://oauth/url" },
      error: null,
    });

    await expect(loginWithGoogle()).rejects.toThrow(/NEXT_REDIRECT/);
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
  });

  it("falls back to localhost:3000 when host header is missing", async () => {
    headerGet.mockReturnValue(null);
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://oauth/url" },
      error: null,
    });

    await expect(loginWithGoogle()).rejects.toThrow(/NEXT_REDIRECT/);
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
  });
});
