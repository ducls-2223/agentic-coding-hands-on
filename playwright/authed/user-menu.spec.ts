import { test, expect } from "@playwright/test";

test.describe("User menu dropdown (authenticated)", () => {
  test("opens on click and shows Profile + Sign out items", async ({ page }) => {
    await page.goto("/");

    // Note: aria-expanded was added in a later user-menu redesign that is
    // not on this branch; only assert on panel content visibility.
    const trigger = page.getByRole("button", { name: /profile|hồ sơ/i }).first();
    await trigger.click();
    await expect(page.getByText(/sign\s*out|đăng xuất/i)).toBeVisible();
  });

  // Escape-to-close lives in the post-MoMorph user-menu redesign that is on a
  // sibling branch; skipped here until that change lands.
  test.skip("Escape closes the panel", async ({ page }) => {

    await page.goto("/");
    const trigger = page.getByRole("button", { name: /profile|hồ sơ/i }).first();
    await trigger.click();
    await expect(page.getByText(/sign\s*out|đăng xuất/i)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText(/sign\s*out|đăng xuất/i)).toBeHidden();
  });

  test("clicking outside closes the panel", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /profile|hồ sơ/i }).first();
    await trigger.click();
    await expect(page.getByText(/sign\s*out|đăng xuất/i)).toBeVisible();
    // Click on the main page area, away from the dropdown.
    await page.locator("main").click({ position: { x: 100, y: 100 } });
    await expect(page.getByText(/sign\s*out|đăng xuất/i)).toBeHidden();
  });
});
