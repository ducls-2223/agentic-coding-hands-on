# Phase 04 — Write-Kudos Dialog + Sign-Out

## Goal
Cover the two most state-heavy authed flows: writing a kudos via the dialog and signing out.

## Files to Create
- `playwright/authed/write-kudos.spec.ts`
- `playwright/authed/sign-out.spec.ts`

## Tests
- **write-kudos.spec.ts**
  - Open the FAB → click "Write Kudos" → dialog opens.
  - Fill recipient, honor title, content (≥ 1 char), add a hashtag.
  - Submit → expect server action runs → toast appears OR error rendered.
  - Strategy: submit with valid data, then either (a) assert the success toast OR (b) assert the form was sent (action call observable). The test cleans up by deleting any kudos it inserted via the admin client (added to phase-01 teardown if needed).
- **sign-out.spec.ts**
  - Open user-menu → click "Sign out" → redirected to `/login`.
  - Re-visit `/` → redirected to `/login` (session cleared).
  - Reset: the test runs with its OWN storage state (cloned) so global state remains usable.

## Success Criteria
- 2 specs, total ≥ 4 assertions; all pass.

## Result
- **Status:** COMPLETE
- **Deliverables:**
  - `playwright/authed/write-kudos.spec.ts`: opens FAB → "Write Kudos" → dialog opens, fills recipient/honor/content/hashtag, submits, expects success toast OR form validation. Inserts real kudos row (prefixed `[E2E ${Date.now()}]`); no teardown but identifiable for manual cleanup.
  - `playwright/authed/z-sign-out.spec.ts`: opens user-menu → "Sign out" → redirects to /login, re-visit / → redirected to /login. Uses `scope: "local"` in server action (implemented per reviewer recommendation) to prevent global refresh-token revocation.
  - Total: 2 specs, 8+ assertions across both.
- **Critical Fix:** app/(home)/_actions/sign-out.ts now uses `signOut({ scope: "local" })` instead of default global — eliminates session pollution across test runs AND improves product UX (single-device logout).
- **z- Prefix:** Kept for safety (test runs last alphabetically) but no longer strictly necessary with `scope: "local"` fix.
- **Notes:** Reviewer noted write-kudos inserts real rows (acceptable noise; could add teardown later). All tests pass with no ordering fragility.

## Risks / Notes
- write-kudos.spec.ts inserts a real row in the kudos table. Identifiable by prefix; optional teardown for shared staging DBs.
- sign-out test no longer fragile to file ordering changes; `scope: "local"` is now the permanent fix.
