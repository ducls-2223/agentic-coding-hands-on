# Playwright E2E Suite: Initial Setup

**Date**: 2026-05-28
**Severity**: Low
**Component**: Testing Infrastructure
**Status**: Resolved

## What Happened

Added a Playwright E2E suite covering the public and authenticated happy paths. 19 tests across 9 spec files. No app logic changed except the sign-out scope fix described below.

New scripts in `package.json`:
- `npm run test:e2e` — run all E2E tests headless
- `npm run test:e2e:ui` — open Playwright UI mode

New files:
- `playwright.config.ts` — project config (3 projects: setup, chromium-public, chromium-authed)
- `playwright/auth.setup.ts` — admin-API session mint (see below)
- `playwright/public/login-page.spec.ts` — login page renders, Google button visible
- `playwright/public/protected-routes-redirect.spec.ts` — unauthenticated routes redirect to `/login`
- `playwright/authed/home.spec.ts` — home page loads with user session
- `playwright/authed/sun-kudos.spec.ts` — kudos feed renders
- `playwright/authed/write-kudos.spec.ts` — open write dialog, fill recipient + message, submit
- `playwright/authed/awards-information.spec.ts` — awards page accessible
- `playwright/authed/profile.spec.ts` — profile page accessible
- `playwright/authed/user-menu.spec.ts` — user menu opens, contains expected items
- `playwright/authed/z-sign-out.spec.ts` — sign-out clears session cookies and redirects to `/login`

## Auth Setup Pattern (Notable)

Email/password login is disabled in this project — only Google OAuth works in the real app. To authenticate a test user without a browser-driven OAuth dance, `auth.setup.ts` uses the Supabase admin REST API:

1. `POST /auth/v1/admin/users` — create the E2E test user if it doesn't exist (`email_confirm: true` bypasses the email gate)
2. `POST /auth/v1/admin/generate_link` with `type: "magiclink"` — admin-mint a magic link. Returns `properties.action_link` (a signed verify URL) and `properties.hashed_token` as fallback
3. Follow the `action_link` with `redirect: "manual"` to extract `access_token` + `refresh_token` from the `Location` header fragment; or fall back to `POST /auth/v1/verify` with the `hashed_token`
4. Reconstruct the `@supabase/ssr` chunked cookie format (`sb-{projectRef}-auth-token[.N]` = base64-encoded session JSON) and inject via `context.addCookies()`
5. Persist to `playwright/.auth/user.json` via `context.storageState()`

The `chromium-authed` project loads this state file, so all authed specs get a real session without touching the OAuth flow. Requires `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` in `.env.local`.

## z- Prefix Workaround for Sign-out

Playwright runs authed specs in alphabetical order within the project. The sign-out spec must execute last because it invalidates the shared session cookies — if it ran earlier, subsequent specs would find no session and fail.

The spec is named `z-sign-out.spec.ts` so it sorts after all other authed specs. In addition, the spec overrides `storageState` to an empty object (`test.use({ storageState: { cookies: [], origins: [] } })`) for the public-visitor guard test, isolating it from the shared session entirely.

## Product Fix: sign-out scope

`app/(home)/_actions/sign-out.ts` was updated to pass `{ scope: "local" }` to `supabase.auth.signOut()`. The default scope (`"global"`) invalidates the refresh token server-side, which logs the user out on all devices. Scope `"local"` clears only the current browser's session cookies without touching other active sessions. This eliminates unexpected multi-device logouts.

The E2E test verifies the fix: after clicking "Sign out", it asserts that `sb-*-auth-token` cookies are cleared and the page redirects to `/login`.

## Relation to Vitest Suite

The Vitest smoke suite (see `journal-260528-vitest-smoke-tests.md`) deliberately noted that async server component paths and real auth flows were out of scope, and recommended Playwright for those paths. This suite closes that gap: authed specs exercise the full server-render + session lifecycle that Vitest cannot reach.

## Coverage Relationship

Playwright E2E is not tracked in the Vitest coverage report. The two suites are complementary:

| Layer | Tool | What it covers |
|---|---|---|
| Unit / component | Vitest + RTL | Component logic, render, interactions in jsdom |
| E2E | Playwright | Full request cycle, real auth cookies, navigation, async server components |
