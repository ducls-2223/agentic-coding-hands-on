# Write-Kudos Toolbar Icons: Invisible-White Fix

**Date:** 2026-05-30
**Severity:** Medium (UI/design mismatch — toolbar icons invisible)
**Component:** `sun-kudos` write dialog — editor toolbar SVG assets (`public/kudos/editor/*.svg`)
**Status:** Resolved

## What Happened

The format-toolbar icons (bold, italic, strikethrough, numbered-list, link, quote) were invisible — the left side of the toolbar rendered blank, while only the red *"Tiêu chuẩn cộng đồng"* link showed. The design renders all six icons in the dark foreground color.

## Root Cause

Every editor icon SVG was exported with `fill="white"` (baked into the path, presumably from a dark-background mockup). The toolbar renders them via `next/image` (`<img>`), and a CSS `text-*` color **cannot** recolor an externally-loaded `<img>` SVG. The button's `text-[#998C5F]` / `text-[#00101A]` classes were therefore inert for the icon — the white fill in the asset *was* the on-screen color. White on the white toolbar = invisible.

This is an asset defect, not a component bug: the rendering pattern is fine, the exported color was wrong for its context.

## The Fix

Changed `fill="white"` → `fill="#00101A"` (the design's foreground, used throughout the dialog for text and mentions) in the six editor-toolbar SVGs only. Out-of-scope icons that legitimately use white (`close-tiny` on a red circle, `send`, `plus`, `chevron-down`) were left untouched.

The active-state feedback already comes from the button's `bg-[#FFEA9E]/60` highlight, so baking a single dark fill matches the design without needing per-state icon recoloring.

## Why Not currentColor / Inline SVG

`fill="currentColor"` would not help here — via `next/image`/`<img>`, an external SVG resolves `currentColor` against its own document, not the parent button, so it would not track active/hover state either. Making the `text-*` toggle truly drive icon color would require inlining the SVGs (SVGR or hand-written components) — more surface area for no design-visible gain, since the design conveys the active state with a background highlight. KISS: fix the asset color.

## Verification

- Live render against the production server: the served `bold.svg` now reports `fill="#00101A"`, and the toolbar screenshot shows all six icons dark and visible — matching the MoMorph frame (previously blank).
- New regression test `__tests__/assets/editor-icon-colors.test.ts`: asserts each of the six SVGs carries the dark fill and never `fill="white"` / `#fff`. Confirmed it fails when an icon is reverted to white and passes after the fix.
- Full suite: 316 passed / 3 skipped. Lint clean.

## Lessons

- **`next/image` (`<img>`) ignores CSS `color` on SVG content.** If an icon must change color by state, it has to be inline SVG (or a CSS mask), not an `<img>`. A `text-*` class beside an `<Image>` icon is a false signal that color is themeable.
- **An icon's color can be a *content* defect.** When an icon "doesn't match the design," check the asset's baked `fill` before touching component code — the SVG export may simply be the wrong color for its background.
