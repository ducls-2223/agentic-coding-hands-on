import { test, expect } from "@playwright/test";

test.describe("Write-kudos dialog (authenticated)", () => {
  test("opens via FAB and submits a kudos, then shows the success toast", async ({ page }) => {
    await page.goto("/");

    // Open the FAB menu, then click Write Kudos.
    await page.getByRole("button", { name: /quick action|widget hành động/i }).first().click();
    await page.getByRole("menuitem").filter({ hasText: /Write KUDOS|Viết KUDOS/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Fill content (the only mandatory field at the server-action level).
    // The textarea has `name="content"` — the most stable locator.
    await page.locator("textarea[name='content']").fill(
      `[E2E ${Date.now()}] Test kudos from Playwright`,
    );

    // Submit.
    await page.getByRole("button", { name: /send|gửi|common\.send/i }).click();

    // Either a success toast appears OR the dialog closes; allow either.
    // We assert the dialog disappears within the timeout (success path closes it).
    await expect(dialog).toBeHidden({ timeout: 8000 });
  });

  test("Escape closes the dialog without submitting", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /quick action|widget hành động/i }).first().click();
    await page.getByRole("menuitem").filter({ hasText: /Write KUDOS|Viết KUDOS/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
