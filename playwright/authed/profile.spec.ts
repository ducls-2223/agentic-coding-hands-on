import { test, expect } from "@playwright/test";

test.describe("Profile page (authenticated)", () => {
  test("renders user display name from user_metadata.full_name", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText("E2E Tester")).toBeVisible();
  });

  test("has a back-to-home link", async ({ page }) => {
    await page.goto("/profile");
    const backLink = page.getByRole("link").filter({ hasText: /back|home|về trang chủ/i });
    await expect(backLink.first()).toBeVisible();
  });
});
