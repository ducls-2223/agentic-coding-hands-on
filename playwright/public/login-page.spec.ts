import { test, expect } from "@playwright/test";

test.describe("Login page (public)", () => {
  test("renders ROOT FURTHER wordmark + Google login button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByAltText("ROOT FURTHER")).toBeVisible();
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
  });

  test("renders the error banner when ?error=oauth_init_failed", async ({ page }) => {
    await page.goto("/login?error=oauth_init_failed");
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("does not render the error banner with no ?error param", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("language switcher toggles VN <-> EN and updates the URL", async ({ page }) => {
    await page.goto("/login");
    const switcher = page.getByRole("button", { name: /VN|EN/ }).first();
    await switcher.click();
    await page.getByRole("option").filter({ hasText: "EN" }).click();
    await expect(page).toHaveURL(/[?&]lang=en/);
  });
});
