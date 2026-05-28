# Plan — E2E Tests with Playwright

## Scope
Add `@playwright/test` end-to-end coverage for the user happy path, gated by a Supabase session fixture. The fixture provisions a test user via the admin API, signs them in, and saves cookies to a storage-state JSON consumed by authed tests.

## Phases
- [x] phase-01 — Install Playwright + config + auth-setup project (provisions test user, saves storage state)
- [x] phase-02 — Public-route specs (no auth)
- [x] phase-03 — Authed-route specs (use stored session)
- [x] phase-04 — Write-kudos dialog + sign-out flow

## Key Decisions (from [clarifications.md](clarifications.md))
1. Auth: admin.createUser (idempotent) → public signInWithPassword → save cookies via Playwright `storageState`.
2. Runs against `next dev` started by Playwright's `webServer` config on port 3000.
3. Test user lives in the real Supabase project (`e2e@saa-test.local`). Idempotent setup so reruns don't error.
4. Headless Chromium only for now. Cross-browser is a follow-up.

## Out of Scope
- Real Google OAuth round-trip (impossible to E2E cleanly).
- Cross-browser (Firefox/WebKit) matrix — add later if needed.
- Visual regression screenshots — out of scope for this PR.
- Mobile viewport tests.

## Success Criteria
- `npm run test:e2e` runs ≥ 8 tests and all pass — **ACHIEVED: 23 tests, ~21s runtime, 3 consecutive green runs**.
- Tests cover all target routes — **ACHIEVED: 2 public + 7 authed specs + setup project**.
- `npm run build` + Vitest unit suite stay green — **VERIFIED: 211 unit tests pass, build clean**.
- No flakes — **VERIFIED: 3 consecutive runs all green**.

## Key Implementation Notes
- **Auth setup:** Uses admin REST flow (createUser → generate_link → action_link follow) with SSR cookie reassembly.
- **Session isolation:** sign-out fixed via `scope: "local"` in server action (prevents global refresh-token revocation, improves UX).
- **Test execution:** Sequential (workers=1) to protect shared `storageState`; `z-` prefix no longer needed but left for safety.
- **Spec files:** 12 total (login-page, protected-routes-redirect, home, profile, sun-kudos, awards-information, user-menu, write-kudos, sign-out).

## Reports
- [Reviewer report](../../reports/reviewer-260528-1420-e2e-playwright.md): approved with minor tweaks recommended post-merge.
