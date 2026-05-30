# Floating-Action-Widget: Pen Icon Color

**Date:** 2026-05-30
**Severity:** Low (UI/design mismatch — icon visible but wrong color)
**Component:** floating-action-widget / rules-modal — `public/widget/widget-pen.svg`
**Status:** Resolved

## What Happened

The "Viết KUDOS" pencil icon rendered white on the yellow `#FFEA9E` button. The design (screen `_hphd32jN2`) draws the pencil in the dark foreground, matching the button's dark `#00101A` label.

## Root Cause

Same class as the editor-toolbar icons earlier this session: `widget-pen.svg` was exported with `fill="white"`. It renders via `next/image` (`<img>`), so the button's `text-[#00101A]` class cannot recolor it — the asset's baked fill is the on-screen color. White on a yellow button reads as wrong/washed-out.

`widget-pen.svg` is used in three places, all on the same yellow button (collapsed FAB pill, expanded "Viết KUDOS" menu item, rules-modal "Viết KUDOS" action), so a single dark fill is correct for every usage. The `widget-thunder` (multi-color red flash) and `widget-close` (white X on the red close button) icons are correct and were left untouched.

## The Fix

`fill="white"` → `fill="#00101A"` in `widget-pen.svg`.

## Verification

- Live render against the production server: served `widget-pen.svg` reports `fill="#00101A"`, and the expanded FAB shows the pencil dark on the yellow button — matching the design.
- New regression test `__tests__/assets/widget-icon-colors.test.ts`: asserts the pen SVG carries the dark fill and never white/`#fff`. Fails when reverted to white, passes after the fix.
- Full suite: 318 passed / 3 skipped.

## Lessons

- This is the second white-`<img>`-SVG icon defect this session (editor toolbar was the first). The pattern recurs because icons are exported for a dark mockup background but reused on light buttons. When adding any `next/image` icon onto a colored button, check the asset's baked `fill` against the background — a `text-*` class next to it is a false promise of themeability.
