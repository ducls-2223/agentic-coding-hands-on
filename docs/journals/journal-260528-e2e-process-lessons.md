# Playwright E2E Session: Process Lessons & Cost Reality

**Date**: 2026-05-28 15:30
**Severity**: Medium
**Component**: E2E Testing / Auth Flow / Test Isolation
**Status**: Resolved

## What Happened

Shipped a 23-test Playwright suite (9 spec files, ~21s, deterministic across 3 runs). Auth implementation consumed the bulk of time; sign-out isolation surfaced a hidden product bug.

## The Brutal Truth

Auth took longer than writing all 22 other specs combined. Not because Playwright is hard—because Supabase's email_provider_disabled forced a path no documentation covers. The first attempt at parsing auth response failed silently: the field was at the top level, not nested under `properties`. A debug log saved hours. Without it, we'd have guessed.

The sign-out scope issue stung because it was invisible until late testing: tests passed individually but failed in sequence. The fix wasn't a test hack—it was an actual product bug (logging out of one device was revoking the global session). That's rare and valuable. It means our test isolation pressure exposed a UX problem.

The FAB locator being too broad (`/fab|menu|open/i`) is embarrassing—regex that matches the entire UI instead of one button. Reviewer caught it.

## Technical Details

- **Auth**: POST to `generate_link` → follow `action_link` → extract tokens from Location fragment → reconstruct @supabase/ssr cookie → save storageState. The debug log revealed response shape: tokens at root, not under `properties`.
- **Sign-out scope**: Without `scope: "local"`, Supabase revokes all sessions. Added to app code; sign-out now device-scoped.
- **Test ordering**: Renamed sign-out spec to `z-` prefix to push last; now test isolation works.

## Lessons Learned

1. **Verify response shapes with debug logs before parsing.** Never assume API response structure matches documentation, especially for Supabase admin endpoints.
2. **Test isolation constraints can reveal product bugs.** When tests fail in sequence but pass alone, it's often not a test problem—it's a state management problem in the product.
3. **Don't build around API limitations.** The email_provider_disabled wasn't a reason to use a fragile workaround; it was a sign to verify the actual flow in the test environment.
4. **Broad locators fail at scale.** Testing 23 specs with loose selectors surfaces flakiness fast.

## Next Steps

- Deferred to backlog: screenshot-on-failure, kudos post-write teardown, env parser inline-comment handling (all non-blocking).
- Monitor sign-out scope change in production; confirm it improves UX without breaking session recovery.
- Use auth flow as template for future Supabase projects.

---

**Status:** DONE
**Summary:** Playwright E2E suite shipped with 23 deterministic tests. Auth was the hard part (Supabase shape verification), sign-out scope fix was a product win. Reviewer feedback on locators addressed.
