# Phase 01 — Playwright Setup + Auth Fixture

## Goal
Install Playwright, write `playwright.config.ts`, create an `auth.setup.ts` project that signs in a deterministic test user and persists session cookies to `playwright/.auth/user.json`.

## Files to Create
- `playwright.config.ts` — projects: `setup`, `chromium-public`, `chromium-authed` (depends on `setup`).
- `playwright/auth.setup.ts` — uses `@supabase/supabase-js` admin client to create user if missing, then public client signInWithPassword, persists storage state via Playwright's `request.storageState`.
- `playwright/.auth/.gitignore` — `*.json` (don't commit captured cookies).
- `playwright/fixtures.ts` — shared test fixtures, e.g. `authedTest` re-exporting `@playwright/test` with `storageState`.

## Files to Modify
- `package.json` — add `test:e2e`, `test:e2e:ui` scripts; devDeps `@playwright/test`.
- `.gitignore` — add `/test-results/` and `/playwright-report/` and `/playwright/.auth/`.

## Implementation Steps
1. `npm install -D @playwright/test`.
2. `npx playwright install chromium` to fetch the browser.
3. Write `playwright.config.ts` with `webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI, env: { NODE_ENV: "development" } }`.
4. Define `setup` project (`testMatch: /.*\.setup\.ts/`) and `chromium-authed` project depending on it.
5. Auth setup script:
   - Read `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY` from process.env.
   - Admin client: `createClient(url, SECRET_KEY)`. `admin.createUser({ email: "e2e@saa-test.local", password: process.env.E2E_USER_PASSWORD ?? "e2e-test-password-2026", email_confirm: true, user_metadata: { full_name: "E2E Tester" } })`. Catch "user already registered" + ignore.
   - Public client: `createClient(url, PUBLISHABLE_KEY)`. `signInWithPassword({ email, password })` → session.
   - Use Playwright `request.newContext()` + cookies API or build cookies directly from session: cookie name `sb-<projectRef>-auth-token` (chunked). Persist via `request.storageState({ path })`.
6. Verify by running `npx playwright test --project=setup` once.

## Success Criteria
- `playwright/.auth/user.json` produced with non-empty cookies array.
- Loading that storage state in a `chromium-authed` smoke test renders the home page (no redirect to /login).
- Setup is idempotent (running twice doesn't error).

## Result
- **Status:** COMPLETE
- **Deliverables:** 
  - `playwright.config.ts` with 3 projects (setup, chromium-public, chromium-authed); webServer auto-starts `next dev` on port 3000.
  - `playwright/auth.setup.ts` implements admin REST flow: createUser → admin/generate_link → action_link follow → SSR cookie chunks → storageState JSON.
  - `playwright/.auth/.gitignore` excludes *.json; test user email `e2e@saa-test.local`, password from `E2E_USER_PASSWORD` env var.
  - `playwright/fixtures.ts` exports authedTest fixture.
  - `package.json` scripts: `test:e2e`, `test:e2e:ui`; devDeps added (@playwright/test, ws, @types/ws for future Supabase JS).
  - `.gitignore` updated with /test-results/, /playwright-report/, /playwright/.cache/, playwright/.auth/*.json.
- **Verification:** Setup runs idempotent, generates user.json with valid cookies; authed test smoke confirms home page loads without /login redirect.
- **Notes:** Auth flow uses SSR cookie reassembly pattern (cookie chunks at MAX_CHUNK=3000). Env parser reads .env.local; fragile edge: inline comments not stripped (noted in review but low risk).
