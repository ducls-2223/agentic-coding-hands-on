import { describe, it, expect, vi, beforeEach } from "vitest";

const exchangeCodeForSession = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() =>
    Promise.resolve({ auth: { exchangeCodeForSession } }),
  ),
}));

import { GET } from "@/app/auth/callback/route";

function makeRequest(url: string) {
  return { url } as unknown as Parameters<typeof GET>[0];
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
  });

  it("redirects to /login?error=oauth_missing_code when no code present", async () => {
    const res = await GET(makeRequest("https://example.com/auth/callback"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://example.com/login?error=oauth_missing_code",
    );
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("exchanges code and redirects to / on success", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await GET(makeRequest("https://example.com/auth/callback?code=abc"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
  });

  it("redirects to /login?error=oauth_exchange_failed on exchange error", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: { message: "boom" } });
    const res = await GET(makeRequest("https://example.com/auth/callback?code=abc"));
    expect(res.headers.get("location")).toBe(
      "https://example.com/login?error=oauth_exchange_failed",
    );
  });
});
