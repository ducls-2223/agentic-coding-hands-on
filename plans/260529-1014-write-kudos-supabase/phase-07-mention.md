# Phase 07 — @Mention Popover (Tiptap Mention Extension)

## Goal
Type `@` in the editor → popover lists Sunners → arrow keys + Enter to insert a mention chip → mention is preserved in saved HTML.

## New dep
- `@tiptap/extension-mention`, `tippy.js` (its renderer)

## Files
- New: `app/sun-kudos/_components/mention-list.tsx` — controlled list rendered inside Tippy popover; calls the existing `searchSunners` server action.
- Modify: `kudos-write-dialog.tsx` — add the Mention extension to the Tiptap editor configuration with `suggestion: { items: searchSunners, render: () => MentionListRenderer }`.
- Modify: `lib/sanitize-kudos-html.ts` — allow `<span data-type="mention" data-id="...">@name</span>`.

## Persistence
- HTML chip format: `<span data-type="mention" data-id="<uuid>">@Alice</span>`.
- Sanitizer preserves the chip; feed renderer styles it (yellow link to a future `/sun-kudos/users/[id]`).

## Acceptance
- Typing `@An` shows the popover filtered to Sunners whose name contains "An".
- Arrow + Enter inserts the mention chip in the editor.
- Submitting persists the HTML containing the chip.
- Feed renders the chip with mention styling.

## Result
**Status:** Completed. New dependencies added: @tiptap/extension-mention, tippy.js (renderer). New file: `mention-list.tsx` (Tippy popover list, calls searchSunners). Tiptap editor extended with Mention extension using standard suggestion API (onStart/onUpdate/onExit lifecycle). Sanitizer updated to allow `<span data-type="mention" data-id="..." data-label="..." data-mention-suggestion-char="@">@name</span>`. Mention chips persist in HTML and render with mention styling in KudosCard feed display.
