# E2E Suite Update — feat/write-kudos (2026-05-29)

## What happened

The `feat/write-kudos` branch had no E2E infrastructure. The full Playwright setup (config, `auth.setup.ts`, 11 specs) was cherry-picked from `feat/unit_test`, then two specs were rewritten/added for the new features on this branch, and two drift items were patched.

## Final result: 25 passed, 1 skipped, 0 failed (3 consecutive green runs)

---

## Spec inventory (10 files, 26 test cases)

### Public (no auth)

| File | Tests |
|---|---|
| `public/login-page.spec.ts` | renders wordmark + Google button; error banner with `?error=`; no banner without param; language switcher toggles VN/EN |
| `public/protected-routes-redirect.spec.ts` | `/`, `/profile`, `/sun-kudos`, `/awards-information` each redirect to `/login` when unauthenticated |

### Authenticated (shared session via `auth.setup.ts`)

| File | Tests |
|---|---|
| `authed/home.spec.ts` | header, nav links, FAB, footer render |
| `authed/awards-information.spec.ts` | 6 award sections render; sticky menu nav links visible |
| `authed/profile.spec.ts` | displays `full_name` from user metadata; back-to-home link present |
| `authed/sun-kudos.spec.ts` | keyvisual + sections render; hashtag filter opens listbox |
| `authed/user-menu.spec.ts` | opens on click and shows sign-out item; clicking outside closes panel; **1 skipped** (see below) |
| `authed/write-kudos.spec.ts` | full happy path (recipient → Tiptap editor → hashtag → submit → dialog closes); submit disabled until fields filled; anonymous checkbox reveals name input; Escape closes dialog |
| `authed/like-kudos.spec.ts` | clicking last heart in All-Kudos feed flips `aria-pressed` end-to-end |
| `authed/z-sign-out.spec.ts` | public visitor sees `/login`; sign-out clears session cookie and redirects |

---

## Notable decisions

### Why `write-kudos.spec.ts` was rewritten

The pre-existing write-kudos spec targeted a `<textarea>` for message input. The new dialog uses a Tiptap ProseMirror `contenteditable` (`.ProseMirror`), a listbox-based recipient autocomplete backed by Supabase, and an inline hashtag chip input. The old spec would have failed structurally, so it was replaced wholesale.

### Why the `like-kudos` persistence-across-reload test was dropped

A persistence variant (like → reload → assert still liked) was prototyped but removed. Two compounding reasons:

1. **Mock IDs in highlight section cards.** The highlight section renders cards with hardcoded mock UUIDs that the server action's UUID validator rejects. The only reliable target is the last heart in the All-Kudos feed (real seed UUIDs). After sign-out and re-login the seed row may have flipped state, making the assertion direction unpredictable without resetting seed state between runs.
2. **React 19 `useTransition` gating.** The like button enters a `pending` state during the server action. A second click while `pending` is silently dropped (by design), so the cleanup click at the end of the single-toggle test can also be gated. The persistence test required two sequential server round-trips with reliable intermediate state, which made it timing-sensitive and flaky across CI environments.

The single-toggle smoke in `like-kudos.spec.ts` proves the end-to-end path without any of these dependencies.

### Why `user-menu.spec.ts` has 1 skip

`test.skip("Escape closes the panel")` — the Escape-to-close behavior is part of the post-MoMorph user-menu redesign that lives on a sibling branch (`feat/unit_test`). The aria-expanded assertion was also removed from the open test for the same reason. Both will be restored when that redesign merges.
