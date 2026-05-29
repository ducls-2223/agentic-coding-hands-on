# Phase 03 — Authed Route E2E

## Goal
E2E specs that use the stored session from phase-01 to visit auth-gated routes.

## Files to Create
- `playwright/authed/home.spec.ts`
- `playwright/authed/profile.spec.ts`
- `playwright/authed/sun-kudos.spec.ts`
- `playwright/authed/awards-information.spec.ts`
- `playwright/authed/user-menu.spec.ts`

## Tests
- **home.spec.ts**: `/` renders, HomeHeader visible, nav links present, language switcher visible, FAB visible.
- **profile.spec.ts**: `/profile` renders, displayName is "E2E Tester" (from user_metadata), back-home link works.
- **sun-kudos.spec.ts**: `/sun-kudos` renders, KudosKeyvisual + HighlightSection + AllKudosSection visible, hashtag filter opens.
- **awards-information.spec.ts**: `/awards-information` renders, 6 award sections present, AwardsMenu visible (sticky).
- **user-menu.spec.ts**: open dropdown, Escape closes, click outside closes, Profile link navigates to `/profile`.

## Success Criteria
- 5 specs, all pass with the stored session.

## Result
- **Status:** COMPLETE
- **Deliverables:**
  - `playwright/authed/home.spec.ts`: renders, HomeHeader visible, nav links present, language switcher visible, FAB visible (locator tightened per reviewer feedback to `/quick action|widget hành động/i`).
  - `playwright/authed/profile.spec.ts`: /profile renders, displayName "E2E Tester" confirmed, back-home link works.
  - `playwright/authed/sun-kudos.spec.ts`: /sun-kudos renders, KudosKeyvisual + HighlightSection + AllKudosSection visible, hashtag filter opens.
  - `playwright/authed/awards-information.spec.ts`: /awards-information renders, 6 award sections present, AwardsMenu visible (sticky).
  - `playwright/authed/user-menu.spec.ts`: dropdown opens, Escape closes, click outside closes, Profile link navigates to /profile.
  - Total: 7 tests, all pass with shared storageState.
- **Locators:** Mostly robust; reviewer noted weak spot in awards-information hash-link selector (low priority, no functional impact).
- **Notes:** Tests run sequentially (workers=1) sharing session; no cleanup needed between specs.
