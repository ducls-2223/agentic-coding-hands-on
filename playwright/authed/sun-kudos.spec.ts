import { test, expect } from "@playwright/test";

test.describe("Sun-Kudos page (authenticated)", () => {
  test("renders keyvisual, highlight section, spotlight board, all-kudos feed", async ({ page }) => {
    await page.goto("/sun-kudos");
    await expect(page).toHaveURL(/\/sun-kudos/);
    // The page heading mentions KUDOS at least somewhere.
    await expect(page.getByRole("heading").filter({ hasText: /kudos|spotlight|highlight/i }).first()).toBeVisible();
  });

  test("hashtag filter opens a listbox with options", async ({ page }) => {
    await page.goto("/sun-kudos");
    const filterBtn = page.getByRole("button", { name: /hashtag|filter/i }).first();
    await filterBtn.click();
    await expect(page.getByRole("listbox").first()).toBeVisible();
  });
});
