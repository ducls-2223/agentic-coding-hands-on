import { test, expect } from "@playwright/test";

test.describe("Awards-information page (authenticated)", () => {
  test("renders the page with multiple award sections", async ({ page }) => {
    await page.goto("/awards-information");
    await expect(page).toHaveURL(/\/awards-information/);
    // The static AWARDS array has 6 entries, each renders an AwardDetail with an id.
    const sections = page.locator("section[id]");
    await expect(sections).toHaveCount(6);
  });

  test("awards sticky menu renders nav links to each award", async ({ page }) => {
    await page.goto("/awards-information");
    // The menu links use href=#slug
    const links = page.locator('a[href^="#"]');
    await expect(links.first()).toBeVisible();
  });
});
