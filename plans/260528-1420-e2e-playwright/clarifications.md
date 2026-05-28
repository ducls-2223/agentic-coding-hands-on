# Clarifications — E2E with Playwright

## Session 2026-05-28

- Q: Commit strategy for the uncommitted unit-test work? → A: Commit unit tests first (shipped: `4c39bed`), then add E2E on top.
- Q: E2E framework? → A: Playwright (`@playwright/test`).
- Q: Auth strategy for Supabase-gated routes? → A: Inject a Supabase session cookie via a fixture (use `SUPABASE_SECRET_KEY` admin client to create/login a test user, save `storageState` to JSON).
- Q: Coverage scope? → A: Full happy path including write-kudos dialog + sign-out.
- Note: Supabase config has `[auth.email].enable_signup = false` (public email signup disabled), so the test user must be created via the **admin** API (`admin.createUser`) which bypasses that gate. Public `signInWithPassword` then works against that user.
