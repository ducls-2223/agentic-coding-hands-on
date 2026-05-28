# Phase 02 — Public Route E2E

## Goal
E2E specs that hit unauthenticated routes. No storage state.

## Files to Create
- `playwright/public/login-page.spec.ts`
- `playwright/public/prelaunch-redirect.spec.ts`

## Tests
- **login-page.spec.ts**
  - Page loads, ROOT FURTHER wordmark visible, Google login button visible.
  - Language switcher toggles VN ↔ EN (URL updates with `?lang=`, label flips).
  - `/login?error=oauth_init_failed` renders the error banner.
- **prelaunch-redirect.spec.ts**
  - Visiting `/prelaunch` while unauthenticated redirects to `/login` (per proxy.ts logic — post-event behavior).
  - (Skip pre-event behavior; depends on event start time.)

## Success Criteria
- 4–5 tests, all pass against the dev server.

## Result
- **Status:** COMPLETE
- **Deliverables:**
  - `playwright/public/login-page.spec.ts`: 3 tests (page loads + wordmark visible, language toggle VN↔EN, error banner on ?error=oauth_init_failed).
  - `playwright/public/protected-routes-redirect.spec.ts`: 1 test (/prelaunch unauthenticated → redirects to /login).
  - Total: 4 tests, all pass.
- **Locators:** Robust (getByRole + getByAltText for accessibility-first selection).
- **Notes:** Reviewer noted missing coverage for other error codes (low priority). All tests pass consistently.
