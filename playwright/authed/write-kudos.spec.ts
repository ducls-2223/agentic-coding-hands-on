import { test, expect } from "@playwright/test";

/**
 * Write-kudos full happy path against the new Tiptap-based dialog +
 * Supabase-backed recipient autocomplete. The dialog now requires:
 *   - recipient_id (from `sunners` table)
 *   - non-empty content (Tiptap ProseMirror editor, not a textarea)
 *   - ≥ 1 hashtag
 * Optional: honor title, anonymous flag, image attachments.
 */
test.describe("Write-kudos dialog (authenticated)", () => {
  async function openDialog(page: import("@playwright/test").Page) {
    await page.goto("/");
    await page
      .getByRole("button", { name: /quick action|widget hành động/i })
      .first()
      .click();
    await page
      .getByRole("menuitem")
      .filter({ hasText: /Write KUDOS|Viết KUDOS/i })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    return dialog;
  }

  test("opens via FAB and submits a fully-filled kudos", async ({ page }) => {
    const dialog = await openDialog(page);

    // 1. Pick a recipient via the autocomplete. Open the listbox and click
    //    the first row regardless of name (seed data populates it).
    await page
      .getByRole("button", {
        name: /Open recipient list|Mở danh sách người nhận/i,
      })
      .click();
    const recipientList = page.getByRole("listbox").first();
    await expect(recipientList).toBeVisible();
    await recipientList.getByRole("button").first().click();

    // 2. Type into the Tiptap editor (ProseMirror contenteditable).
    const editor = page.locator(".ProseMirror").first();
    await editor.click();
    await editor.fill(`[E2E ${Date.now()}] Test kudos from Playwright`);

    // 3. Add a hashtag. The HashtagChips renderer opens an inline input
    //    when the + button is clicked.
    await page
      .getByRole("button")
      .filter({ hasText: /Hashtag/i })
      .first()
      .click();
    await page.getByPlaceholder(/Inspiring/i).fill("e2e");
    await page.getByPlaceholder(/Inspiring/i).press("Enter");

    // 4. Submit. The button enables once required fields are filled.
    const submit = page.getByRole("button").filter({ hasText: /Gửi|Send/i });
    await expect(submit).toBeEnabled();
    await submit.click();

    // Dialog should close on success.
    await expect(dialog).toBeHidden({ timeout: 10_000 });
  });

  test("submit stays disabled until all required fields are filled", async ({
    page,
  }) => {
    await openDialog(page);
    const submit = page.getByRole("button").filter({ hasText: /Gửi|Send/i });
    await expect(submit).toBeDisabled();
  });

  test("toggling Anonymous reveals the anonymous-name input", async ({
    page,
  }) => {
    await openDialog(page);
    await page
      .getByText(/Gửi lời cám ơn.*ẩn danh|Send thanks.*anonymously/i)
      .click();
    await expect(
      page.getByPlaceholder(/Tên ẩn danh|Anonymous name/i),
    ).toBeVisible();
  });

  test("Escape closes the dialog without submitting", async ({ page }) => {
    const dialog = await openDialog(page);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
