# Write-Kudos Editor: Segmented Toolbar Layout

**Date:** 2026-05-30
**Severity:** Low (visual/layout polish — functionality intact)
**Component:** `sun-kudos` write dialog — `editor-toolbar.tsx`, `kudos-editor.tsx`
**Status:** Resolved

## What Happened

After the placeholder and icon-color fixes, the editor still didn't match the design. The toolbar rendered as borderless 32px icon buttons inside a single rounded outer box; the design specifies a **segmented bordered button group**.

## Design (authoritative, from MoMorph node specs)

- **Toolbar (`mms_C`, 40px tall):** each control is a 56×40 cell with `1px solid #998C5F`, a 24px icon, transparent background. The first cell rounds its top-left corner (`8px 0 0 0`); the wide guidelines cell on the right rounds its top-right (`0 8px 0 0`).
- **Text field (`mms_D`):** `1px solid #998C5F`, white background, `padding-left: 24px`, height ~200px, rounded **bottom** corners (`0 0 8px 8px`).
- The editor box has no outer border of its own — the toolbar cells and the text field each carry their own border, and the shared edges line up into single rules.

## The Fix

- **`editor-toolbar.tsx`:** rebuilt the row as a segmented group — each button is `h-10 w-14` (56×40) with `border border-[#998C5F]`; `-ml-px` on every button after the first collapses the shared vertical border so adjacent cells read as one divider. First button `rounded-tl-lg`; the guidelines link is now its own `flex-1` cell with `rounded-tr-lg`. Icons bumped from 16px to 20px to fit the taller cell.
- **`kudos-editor.tsx`:** replaced the single `rounded-lg border` wrapper with a `flex flex-col`: the toolbar forms the top, and the `EditorContent` sits in a `-mt-px rounded-b-lg border` box (white bg). `-mt-px` collapses the toolbar's bottom border into the text field's top border. The error state now colors the text-field border red. Content padding raised to `px-6` (24px) and min height to 200px to match the spec.

## Why `-ml-px` / `-mt-px` Instead of a Shared-Border Container

A segmented control where every cell has its own border double-draws the shared edges (2px lines, and corners darker). The classic fix is a `border-collapse`-style table, but these are flex buttons. Pulling each subsequent cell back by 1px (`-ml-px` horizontally, `-mt-px` for the text field below) overlaps the duplicate borders into a single crisp 1px line — KISS, no extra wrapper elements, and the rounded corners still land on the right cells.

## Verification

- Live render against the production server: the toolbar shows six bordered icon cells + the guidelines cell, the text field is bordered with rounded bottom corners and the placeholder — matching the MoMorph frame.
- New regression test in `editor-toolbar.test.tsx`: asserts the format buttons carry `border-[#998C5F]` and the row corners are rounded (`rounded-tl-lg` / `rounded-tr-lg`) — fails if the toolbar regresses to borderless.
- Full suite: 317 passed / 3 skipped. E2E `write-kudos` 5/5 (interaction unaffected). Build + lint clean.

## Lessons

- **Read the per-node design specs, don't eyeball the composite.** The segmented borders were easy to miss in the full-frame screenshot but explicit in each button node (`border: 1px solid #998C5F`, per-cell `border-radius`). The component-level spec is the source of truth for layout, not the rendered thumbnail.
- **Segmented borders are a 1px-overlap problem, not a new-component problem.** Negative margins collapse duplicate edges without restructuring.
