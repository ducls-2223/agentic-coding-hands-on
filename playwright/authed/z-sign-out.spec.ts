import { test, expect } from "@playwright/test";

// Sign-out invalidates the shared session cookies. Run it last and reset
// storageState to empty so other specs (which run before this in alphabetical
// order) keep working. We force a fresh empty context to isolate from
// the shared user.json.
test.describe("Sign-out flow", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("public visitor sees /login when navigating to /", async ({ page }) => {
    // Sanity guard: without a session, root redirects to /login.
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Sign-out from user menu", () => {
  test("sign-out clears session and redirects to /login", async ({ page, context }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");

    // Open the user menu, then click "Sign out".
    const trigger = page.getByRole("button", { name: /profile|hồ sơ/i }).first();
    await trigger.click();

    const signOut = page.getByRole("button").filter({ hasText: /sign\s*out|đăng xuất/i });
    await signOut.click();

    // Server action redirects to /login.
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    // Verify the auth cookie was cleared.
    const cookies = await context.cookies();
    const authCookies = cookies.filter((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
    expect(authCookies, "auth cookies should be cleared after sign-out").toHaveLength(0);
  });
});
