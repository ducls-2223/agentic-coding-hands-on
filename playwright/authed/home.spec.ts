import { test, expect } from "@playwright/test";

test.describe("Home page (authenticated)", () => {
  test("renders header, nav links, FAB and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    // Three nav links inside HomeHeader.
    await expect(page.getByRole("link", { name: /SAA|Sun.*KUDOS|About SAA|Hồ sơ|Awards/i }).first()).toBeVisible();
    // Floating Action Widget (FAB) shows for signed-in users on non-prelaunch routes.
    await expect(
      page.getByRole("button", { name: /quick action|widget hành động/i }).first(),
    ).toBeVisible();
  });
});
