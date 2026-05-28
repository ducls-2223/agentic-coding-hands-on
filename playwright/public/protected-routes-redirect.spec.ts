import { test, expect } from "@playwright/test";

test.describe("Protected routes redirect unauthenticated visitors", () => {
  for (const route of ["/", "/profile", "/sun-kudos", "/awards-information"]) {
    test(`${route} -> /login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login(\?|$)/);
    });
  }
});
