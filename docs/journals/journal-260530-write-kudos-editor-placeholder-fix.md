# Write-Kudos Editor: Placeholder + Formatting Fix

**Date:** 2026-05-30
**Severity:** Medium (UI/design mismatch, no data loss)
**Component:** `sun-kudos` write dialog — Tiptap editor (`kudos-editor.tsx`, `globals.css`)
**Status:** Resolved

## What Happened

The write-kudos rich-text editor didn't match the MoMorph design. Two compounding defects:

1. **The empty editor showed no placeholder.** The design displays *"Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!"* in the empty editor. The code set a bare `data-placeholder` attribute on the ProseMirror root and assumed it would render — but Tiptap core does nothing with a raw attribute. `@tiptap/extension-placeholder` was never installed, and there was no CSS to surface it. Result: blank editor.

2. **Formatting (bold / list / quote) rendered unstyled.** The content area used `prose prose-sm` classes, but this is Tailwind v4 (`@import "tailwindcss"` in `globals.css`) with **no `@tailwindcss/typography` plugin** loaded — so `prose` is inert. Tailwind's preflight then strips `<ol>` / `<ul>` / `<blockquote>` styling, so the numbered-list and quote toolbar buttons produced invisible results.

## Root Cause

Both defects share one theme: **relying on a mechanism that was never wired up.** The `data-placeholder` attribute and the `prose` classes are each meaningful only when a supporting layer exists (the Placeholder extension; the typography plugin). Neither layer was present, so both were silent no-ops — the kind of bug that passes type-check and build but fails visually.

## The Fix

- Installed `@tiptap/extension-placeholder@^3.23.6` (matches the rest of the Tiptap v3 stack) and wired `Placeholder.configure({ placeholder: t("kudos.dialog.content_placeholder") })`. Removed the dead manual `data-placeholder` attribute — the extension now applies it to the empty node along with the `is-editor-empty` class.
- Replaced the inert `prose prose-sm max-w-none` classes with a scoped `.kudos-prose` class and explicit CSS in `globals.css` for the placeholder pseudo-element, lists, blockquote, links, and strikethrough.

**Why scoped CSS over the typography plugin:** the editor only needs list + blockquote + basic marks. Pulling in `@tailwindcss/typography` adds an opinionated, theme-fighting dependency (the original author already had to neutralize it with `max-w-none`). A handful of scoped rules is KISS, predictable, and dependency-free.

## Verification

- Production `next build` succeeds; the emitted CSS chunk confirmed to contain `content:attr(data-placeholder)` — proving the toolchain keeps the rules.
- Unit suite: 310 passed / 3 skipped; `kudos-editor.test.tsx` 14/14 including a new regression guard that asserts the Placeholder extension is configured with the design's placeholder text (fails without the fix).
- E2E `write-kudos.spec.ts`: 5/5 — editor still works end-to-end (recipient → type → hashtag → submit).
- **Live render** against the production server: the empty editor's `::before` content equals the exact design string in color `#998C5F`. Screenshot matched the MoMorph frame.

## Lessons

- **A stale dev server lies.** Mid-diagnosis, the browser reported the new CSS rule as absent even after editing `globals.css` — the running `next dev` (started before the edit) served cached CSS, and a `touch` didn't force a recompile. The production build was the reliable source of truth. When a CSS change "doesn't apply," verify against a fresh build before assuming a toolchain bug.
- **Next.js 16 + Turbopack dev injects CSS via JS, not a `<link>`.** Grepping page HTML for a `.css` bundle finds nothing; the compiled CSS lives under `.next/static/chunks/`, not `.next/static/css/`.
- **An attribute is not a feature.** `data-placeholder` and `prose` looked like working code in review; both were no-ops without their supporting layer. Prefer the library's documented extension over hand-rolled attribute conventions.
