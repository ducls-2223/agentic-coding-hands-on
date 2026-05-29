# Vitest Smoke Test Suite: Initial Setup

**Date**: 2026-05-28
**Severity**: Low
**Component**: Testing Infrastructure
**Status**: Resolved

## What Happened

Added Vitest 4 + React Testing Library + jsdom as devDependencies. Created 6 page-level smoke tests covering: home, login, prelaunch, profile, sun-kudos, awards-information. No app code changed; this is purely a testing layer on top of the existing pages.

New scripts in package.json:
- `npm test` — watch mode (vitest)
- `npm test:run` — single-run (vitest run)

New files:
- `vitest.config.mts` — Vitest configuration
- `vitest.setup.ts` — global test setup
- `__tests__/helpers/mock-supabase.ts` — Supabase client stub
- `__tests__/helpers/mock-i18n.ts` — i18n stub
- `__tests__/helpers/stub-component.tsx` — sync stub for async server components
- `__tests__/pages/*.test.tsx` — one file per page

## The Brutal Truth

Next 16's Vitest integration does not support async server components directly — Vitest's test environment can't await a component tree the way the Next runtime does. The workaround is to mock async children as synchronous stubs (`stub-component.tsx`). This means smoke tests validate that a page renders without crashing, not that async data-fetching logic runs correctly. Integration tests or Playwright E2E are needed to cover the async paths.

## Technical Details

**Constraint:** `stub-component.tsx` is intentional, not a gap. Per Next 16 docs, Vitest cannot execute async server components. Mocking them as sync stubs is the documented workaround.

**Scope of tests:** Page-level smoke tests — they assert the page mounts and key structural elements are present. They do not test business logic, data fetching, or user interactions beyond trivial render assertions.

**Mocks in play:**
- Supabase: `mock-supabase.ts` returns a fixed session/user object; no real network calls
- i18n: `mock-i18n.ts` returns translation keys as-is; no locale loading

## Why This Matters

Contributors now have a fast local feedback loop: `npm test:run` catches import errors, broken component trees, and missing providers before a push. CI can run the same command without additional configuration.

## Next Steps

- Add interaction tests (RTL `userEvent`) for forms and navigation flows as complexity grows
- Consider Playwright for E2E coverage of async server component paths
- If async server component support lands in a future Vitest/Next release, remove stub-component workaround and re-evaluate test strategy

---

# Vitest Suite Expansion: Helpers + Client Components

**Date**: 2026-05-28 (same session)
**Coverage**: 4% → 32% | 13 → 78 tests | 21 test files

## What Changed

**15 new test files added:**

Helper tests (6):
- `mock-supabase`, `mock-i18n`, `stub-component`, `supabase-client`, `supabase-server`, `i18n`

Client component tests (9):
- `localized-link`, `language-context`, `use-translation`, `user-menu`, `language-switcher`, `google-login-button`, `login-error-banner`, `hashtag-filter`, `department-filter`

**Config / infra changes:**
- `vitest.config.mts`: added `server-only` alias pointing to an empty-module stub — required to import server-only modules in the jsdom environment without crashing
- Added `@vitest/coverage-v8` devDep; `npm test -- --coverage` now produces v8 coverage reports

**No app code changed.**

## Coverage Jump Explained

The 4% → 32% jump comes from client components being fully exercisable in jsdom (no async server component constraint). RTL `render` + `userEvent` covers real interaction paths: language switching, menu open/close, filter selection, error banner display, Google login button rendering.

## Constraints Unchanged

The `stub-component.tsx` workaround for async server components remains. Page-level smoke tests are still render-only assertions. The new client component tests are more substantive — they exercise component logic, not just mount checks.

---

# Vitest Suite Expansion: Full Component + Server Coverage

**Date**: 2026-05-28 (third wave)
**Coverage**: 32% → 93% statements | 78 → 198 tests | 46 test files | ~9.2s

## What Changed

**~25 new test files added across four areas:**

Presentational components (home / login / awards):
- Smoke tests for components in `home/`, `login/`, and `awards-information/` that have no async dependency

Server-side logic:
- Server actions: `signOut`, `loginWithGoogle`, `createKudos`
- Route handler: `auth/callback`
- `layout.tsx` (root layout render)

State-heavy client components:
- `countdown-timer`, `rules-modal`, `floating-action-widget`, `prelaunch-content`

`sun-kudos` client components (full slice):
- Interactive: `kudos-card`, `kudos-action-bar`, `hashtag-chips`, `recipient-autocomplete`, `kudos-write-dialog`, `kudos-input-bar`, `editor-toolbar`, `kudos-sidebar`
- Presentational: `spotlight-board`, `kudos-keyvisual`, `all-kudos-section`, `highlight-section`

## Coverage Milestone

| Metric | After | Target |
|---|---|---|
| Statements | **93.15%** | 90% |
| Functions | **94.17%** | 90% |
| Lines | **96.52%** | 90% |
| Branches | **84.73%** | 90% |

Statements, functions, and lines all cleared 90%. Branches remain below target.

## Why Branches Stall at 84%

Three structural constraints suppress branch coverage without clean workarounds:

1. **Stubbed async children.** When an async server component is stubbed, all conditional branches inside it (loading states, error guards, data-present vs empty) are never executed. The stub returns a fixed element; the real code path is unreachable in jsdom.

2. **Runtime-only branches.** Several components have branches that only activate under Next.js runtime conditions (e.g., middleware redirect logic, `cookies()`/`headers()` availability). jsdom cannot replicate these.

3. **IntersectionObserver guards.** Components that gate rendering on `IntersectionObserver` presence require `window.IntersectionObserver` to be stubbed globally. Even with the stub in place, some fallback branches (the `else` path when the observer isn't supported) remain untouched because the stub always satisfies the truthy check.

Reaching 90% branches would require either Playwright E2E coverage or significant refactoring to extract and unit-test the branch logic in isolation.

## Notable Patterns Introduced

- `IntersectionObserver` stub added to `vitest.setup.ts` — required for any component using scroll-triggered visibility
- Async server parents tested by stubbing each async child with `stub-component.tsx` and asserting the parent shell renders
- `@vitest/coverage-v8` confirmed as the coverage provider; no Istanbul config needed
