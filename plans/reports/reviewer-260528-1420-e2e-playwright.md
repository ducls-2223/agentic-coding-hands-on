# E2E Playwright Suite Review

**Branch:** feat/unit_test  
**Files reviewed:** playwright.config.ts, auth.setup.ts, 12 spec files, .gitignore, package.json delta

---

## Answers to the 7 specific questions

### 1. Auth flow correctness

**Verdict: correct approach, two fragile edges worth noting.**

Admin `createUser` → `admin/generate_link` → follow `action_link` → build SSR cookies is the right pattern for an email-login-disabled project. It bypasses the disabled-email gate because it uses the service-role admin path, not the user-facing signup flow.

**Fragile edge A — URL fragment parsing.**  
The `action_link` follow uses `fetch(actionLink, { redirect: "manual" })` and parses the `Location` header's hash. This is correct for Supabase's current verify endpoint which redirects with `#access_token=...`. The fallback to `hashed_token` / POST `/auth/v1/verify` protects against a response shape that lacks `action_link`. Risk: if Supabase ever migrates to PKCE-style redirects (code in query param, not fragment), the hash parser silently returns empty tokens and setup throws a clear error — so degradation is loud rather than silent. Acceptable.

**Fragile edge B — `expires_at` math.**  
Line 121: `expires_at: Math.floor(Date.now() / 1000) + expires_in`. This is computed after `fetch(action_link)` + `fetch(/auth/v1/user)`, so there is a small positive drift (a few milliseconds to a few seconds). Not material; the access token's real expiry is baked into the JWT, and Supabase SSR will refresh via the `refresh_token` anyway.

**Fragile edge C — cookie chunk size.**  
`MAX_CHUNK = 3000` matches the `@supabase/ssr` default (it uses 3600 for the base cookie name and 3600 for each chunk). The code matches the convention but hard-codes a different threshold (3000 < 3600). This is conservative and works; a future `@supabase/ssr` bump that changes the chunk naming scheme (e.g. `.0`, `.1` vs `.0`, `.1` starting from 0) would silently produce wrong cookie names. Low risk right now.

**Env parser edge case (warning).**  
`playwright.config.ts` parses `.env.local` manually (lines 8–13). The regex `(.*)` after `=` captures everything including a second `=`, so base64-padded values and JWT tokens work. However, inline comments (`KEY=value # comment`) are not stripped — the comment becomes part of the value. If `.env.local` ever has inline comments, Supabase URL / key will be corrupt and setup will fail with an opaque `fetch` error. Not a blocker but worth a note.

---

### 2. Sign-out session pollution

**Verdict: the `z-` workaround is acceptable for a single-worker local suite; not production-grade for CI scale.**

The core problem: `supabase.auth.signOut()` without `{ scope: "local" }` calls `POST /auth/v1/logout` with `scope=global`, which invalidates the refresh token on the Supabase side. Once that fires, the `refresh_token` stored in `user.json` is dead. All subsequent authed specs that try to refresh the session will get 401s.

The `z-` naming trick works because:
- `workers: 1` + `fullyParallel: false` guarantees alphabetical ordering within the `chromium-authed` project.
- `z-sign-out.spec.ts` sorts last.
- The first `describe` block in that file resets `storageState` to empty, protecting the sanity guard test from the live cookies.

**Risks:**
1. A developer adds another spec file and names it `z-something-else.spec.ts` or `zz-*.spec.ts` and it runs before sign-out. Ordering is implicit and invisible.
2. If Playwright ever changes default ordering (it uses filesystem order on some platforms, alphabetical on others), this silently breaks.
3. `workers: 1` is a bottleneck — the moment the suite grows, someone will raise `workers` and break the ordering guarantee.

**Recommended fix (medium priority):** Change `sign-out.ts` to use `{ scope: "local" }` in the server action, or add a `scope: "local"` option to the `signOut` call. This eliminates the problem entirely and is a correct improvement to the production code: `scope: "local"` clears the browser session without revoking the server-side token, which is appropriate for a single-device logout. Alternatively, create a dedicated sign-out test user so the global revocation doesn't affect the shared E2E user.

---

### 3. Locator strategies

**Verdict: mostly robust, two weak spots.**

- `page.getByRole("button", { name: /google/i })` — stable, role + accessible name.
- `page.getByRole("alert")` — stable ARIA role assertion.
- `page.getByRole("button", { name: /VN|EN/ })` + `page.getByRole("option")` — stable.
- `page.getByAltText("ROOT FURTHER")` — stable as long as alt text doesn't change.
- `/profile|hồ sơ/i` — covers both languages, good.
- `page.locator("textarea[name='content']")` — stable attribute selector, good.
- `section[id]` count of 6 — hardcoded to the current AWARDS array length. If a 7th award is added, the test breaks immediately with a clear failure message. That is acceptable brittleness — it acts as a guard against unintended data changes.

**Weak spot A — home.spec.ts FAB locator.**  
`page.getByRole("button", { name: /fab|menu|open/i }).first()` is very broad. "Open quick action menu" matches `/open/i` but so might a nav link or other button on the page that contains "open". The `.first()` silences a multi-match, meaning the test could be clicking the wrong element. Recommend tightening: `page.getByRole("button", { name: /quick action|widget hành động/i })` (same pattern used in write-kudos.spec.ts, which is more precise).

**Weak spot B — `page.locator('a[href^="#"]')` in awards-information.spec.ts.**  
This matches any anchor with a hash href, including any third-party library anchors. If a component library adds such anchors, the assertion `toBeVisible()` on `.first()` passes regardless. Not a functional bug, but it tests "some hash link exists" rather than "the awards sticky menu renders links". Could be tightened to `page.locator('[data-testid="awards-menu"] a[href^="#"]')` or by scoping to the menu component.

---

### 4. Write-kudos inserting real rows

**Verdict: acceptable noise for a dev/staging project; worth a note for production-grade hygiene.**

The test inserts a real `kudos` row with `[E2E ${Date.now()}] Test kudos from Playwright` as content. This is identifiable by the prefix. Risks:

- **Noise in the feed:** E2E rows appear in the all-kudos list visible to real users if this runs against a shared staging DB.
- **No teardown:** rows accumulate on every CI run. With retries, a single failed run creates up to 2 rows.
- **RLS assumption:** if Row Level Security on the `kudos` table ever restricts read access so the test user can't insert, the spec silently tests nothing (it just checks `dialog.toBeHidden()` which will be true on any error path that closes the dialog).

**Recommended fix (low priority):** Add an `afterAll` block that deletes `kudos` rows where `content LIKE '[E2E %]'` using the service-role key, or a dedicated teardown script. This is optional if the DB is ephemeral per CI run.

---

### 5. playwright.config.ts gaps

**Overall: solid. Three minor gaps.**

| Setting | Current | Assessment |
|---|---|---|
| `trace` | `retain-on-failure` | Good — artifacts only when needed |
| `retries` | CI=1, local=0 | Acceptable for a 20s suite. 1 retry on CI may mask true flakiness — consider 2 for SSR pages with cold-start latency, but 1 is defensible. |
| `workers` | 1 | Correct given shared session state. |
| `fullyParallel` | false | Correct. |
| `actionTimeout` | 10s | Fine. |
| `navigationTimeout` | 20s | Fine. |
| `screenshot` | not set | **Gap:** no screenshot on failure. Add `screenshot: "only-on-failure"` for easier CI debugging — traces alone can be sparse for layout regressions. |
| `video` | not set | Optional, but useful for flaky animation-related tests. Skip for now. |
| `forbidOnly` | CI=true | Correct. |
| `webServer.reuseExistingServer` | `!CI` | Correct. |
| CI reporter | `"github"` | Correct for GitHub Actions. Consider `["github", "html"]` tuple to also generate the HTML report artifact. |

**Gap: no `test:e2e:ci` script** that sets `CI=1` and specifies a headed/headless flag explicitly. Currently relies on Playwright's auto-headless detection. Not a bug, just a convention gap.

---

### 6. Public spec coverage

**Verdict: adequate for current scope. One obvious missing test.**

Current coverage:
- Login page renders correctly (wordmark, Google button)
- Error banner on `?error=oauth_init_failed`
- No error banner without param
- Language switcher updates URL

**Missing:** `/login` with a valid `?error=` value that is NOT `oauth_init_failed` — does the banner still render? The implementation likely shows a generic error for unknown codes, which is worth a smoke test. Low priority.

**Also missing (suggestion, not required):** A test that the Google OAuth button actually initiates a redirect to accounts.google.com. This can be done by intercepting the network request without following it: `page.waitForRequest(/accounts\.google\.com/)` after clicking the button. Medium value for regression coverage, skip for now given the test is against a real Supabase instance.

---

### 7. Overall verdict

**Approve with tweaks.**

The suite is well-structured for its scope: clean separation of public/authed projects, correct setup dependency declaration, no `waitForTimeout` anti-patterns, sensible timeouts, and the auth flow is technically sound. The 23-test / ~20s runtime is a good baseline.

**Required before merge:** None that block correctness. The suite passes and tests real behavior.

**Recommended before merge:**
1. (High) Investigate changing `signOut()` to `scope: "local"` to eliminate the `z-` ordering fragility. One-line change in the server action.
2. (Medium) Tighten the home.spec.ts FAB locator from `/fab|menu|open/i` to `/quick action|widget hành động/i`.

**Post-merge / backlog:**
3. (Low) Add `screenshot: "only-on-failure"` to `playwright.config.ts`.
4. (Low) Add kudos teardown or mark E2E rows if the staging DB is shared.
5. (Low) Document `E2E_USER_EMAIL` and `PLAYWRIGHT_BASE_URL` in `.env.example`.
6. (Low) Strip inline comments in the env parser in `playwright.config.ts` (add `.replace(/#.*$/, "").trim()` to `m[2]` processing).

---

## Critical Issues

None.

## Security

- `user.json` is gitignored via `playwright/.auth/.gitignore` — confirmed not tracked. No token leak to VCS.
- `SUPABASE_SECRET_KEY` is only used in `auth.setup.ts` and never passed to the browser context or baked into storageState. Clean.
- The base64-encoded session in `user.json` contains a full access + refresh token. It is ephemeral (gitignored, regenerated per setup run). Acceptable.

## Metrics

- Test count: 23 (1 setup + 22 specs)
- Browsers: Chromium only (single engine — fine for a component-level smoke suite)
- Parallelism: sequential (workers=1)
- Coverage: public routes + all 4 authenticated pages + user menu + write-kudos + sign-out
