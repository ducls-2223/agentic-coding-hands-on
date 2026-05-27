# Phase 01 — Restyle Dropdown Panel

## MoMorph refs
- Dropdown-profile: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/z4sCl3_Qtk
- Clarifications: ./clarifications.md

## Goal
Replace the open dropdown panel markup + styling in [app/_components/user-menu.tsx](../../app/_components/user-menu.tsx) so it visually matches the MoMorph design while keeping current behavior.

## Design Notes (from specs + image)
- Container: dark rounded card, padding around items, drop shadow.
- Item A.1 Profile: ~119×56 px, label left + user icon right, hover/focus = bright background + soft glow.
- Item A.2 Logout: same row size, label left + chevron-right icon right, hover = subtle highlight.
- Both items share `icon_text` button layout (text on left, icon on right).

## Files to Modify
- [app/_components/user-menu.tsx](../../app/_components/user-menu.tsx) — replace dropdown panel `<div>` block (currently lines 58–79).

## Files to Leave Untouched
- Trigger `<button>` (lines 35–56)
- Click-outside `useEffect`
- `home-header.tsx`, sign-out action, translations

## Implementation Steps
1. Remove the `displayName` header `<div>` inside the open panel.
2. Rewrite panel container classes: dark bg (`#101417`-ish), rounded, gold/warm border consistent with site palette, soft shadow, fixed width that fits both items + padding.
3. Profile `<Link>` becomes a flex row: label left, user icon (`/home/icon-user.svg`) right. Idle = transparent; hover/focus = bright background + glow (e.g. `hover:bg-[#FFEA9E]/15` + `hover:shadow-[0_0_12px_rgba(255,234,158,0.35)]`).
4. Logout `<button>`: same flex layout, chevron-right icon (`/home/icon-arrow-right.svg`) on right, subtle hover background.
5. Keep `onClick={() => setOpen(false)}` on Profile so menu closes on navigate.
6. Preserve `signOutAction` form binding for Logout.

## Visual Validation
- Start dev server (`npm run dev`), sign in, open header user menu, compare to MoMorph frame.
- Verify hover states on both items.
- Verify click-outside still closes panel.

## Acceptance Criteria
- Panel layout/colors/icons match MoMorph frame.
- No regressions in trigger or behavior.
- `npm run build` and `npm run lint` pass.

## Result

**Status:** COMPLETE — Shipped in feature/dropdown_profile, ready for merge.

**File Modified:** [app/_components/user-menu.tsx](../../app/_components/user-menu.tsx)

**Changes Delivered:**
- Removed `displayName` header row from dropdown panel (as specified).
- Panel container restyled: dark bg (#101417), rounded-lg, subtle border (#2E3940), soft shadow, w-38 fixed width, gap-1 + p-2 spacing.
- Profile link: flex row layout, label left + user icon (/home/icon-user.svg) right, idle state flat, hover/focus = warm-tint bg (#FFEA9E/15) + glow shadow, `transition-colors` for consistency.
- Logout button: same flex layout, inline chevron-right SVG (currentColor), subtle white/10 hover background.
- Both Profile and Logout routes preserved (`/profile` link, `signOutAction` form binding).

**A11y Improvements (applied post-review):**
Reviewer identified four a11y gaps; all addressed before merge:
1. **Focus visibility:** Added `focus-visible:ring-1` to both items (Profile: ring-[#FFEA9E]/60, Logout: ring-white/40) replacing bare `outline-none`. Satisfies WCAG 2.1 SC 2.4.7 on dark background.
2. **Keyboard trap:** Added Escape-key handler in useEffect (lines 29–31) to close dropdown. Standard WAI-ARIA menu pattern compliance.
3. **Trigger button a11y:** Added `aria-expanded={open}` + `aria-haspopup="menu"` to trigger button (lines 45–46). Screen readers now announce menu state.
4. **CSS consistency:** Profile link `transition-colors` matches Logout; removed overly-broad `transition-all`.

**QA Results:**
- `npm run build` clean.
- `npm run lint` clean.
- Visual validation: panel matches MoMorph frame z4sCl3_Qtk.
- Click-outside-to-close verified.
- Menu closes after Profile navigation.
- Keyboard navigation (Escape) verified.
