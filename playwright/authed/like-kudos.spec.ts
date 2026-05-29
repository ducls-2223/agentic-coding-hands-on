import { test, expect } from "@playwright/test";

/**
 * Like-kudos integration smoke. The unit tests in
 * __tests__/components/sun-kudos/kudos-action-bar.test.tsx already cover the
 * optimistic-toggle math + rollback. This spec verifies the integration:
 * clicking a heart in a real feed card triggers the server action and the
 * heart's pressed state visibly flips.
 *
 * We target the LAST heart on the page so we land in the All-Kudos feed
 * (real seed UUIDs). Highlight section cards use mock IDs that the action's
 * UUID validator rejects.
 */
test.describe("Like-kudos integration smoke (authenticated)", () => {
  test("clicking the heart flips aria-pressed in a real feed card", async ({ page }) => {
    await page.goto("/sun-kudos");
    const heart = page
      .getByRole("button", { name: /sun_kudos\.card\.(un)?like|Thả tim|Bỏ tim|^Like$|^Unlike$/i })
      .last();
    await expect(heart).toBeVisible();
    await heart.scrollIntoViewIfNeeded();

    const initialPressed = (await heart.getAttribute("aria-pressed")) ?? "false";

    await heart.click();
    // Wait for optimistic flip + server reconcile to settle.
    await expect(heart).toHaveAttribute(
      "aria-pressed",
      initialPressed === "true" ? "false" : "true",
      { timeout: 10_000 },
    );

    // Best-effort cleanup so seed state stays where we found it. If this
    // click is gated by `pending`, the test still passes — we proved the
    // first toggle worked end-to-end.
    await page.waitForTimeout(500);
    await heart.click().catch(() => {});
    await page.waitForTimeout(500);
  });
});
