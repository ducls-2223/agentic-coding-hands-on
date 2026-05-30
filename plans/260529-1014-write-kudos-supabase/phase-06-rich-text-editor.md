# Phase 06 — Tiptap Rich-Text Editor

## Goal
Wire the toolbar (Bold / Italic / Strike / OrderedList / Link / Blockquote) to a real Tiptap editor; store content as sanitized HTML; render in `KudosCard` safely.

## New deps
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`
- `isomorphic-dompurify` (for sanitization on both client display + server insert)

## Files
- Modify: `app/sun-kudos/_components/editor-toolbar.tsx` — accept an `editor` prop (Tiptap instance), wire each button to `editor.chain().focus().toggleBold().run()` etc.
- Modify: `kudos-write-dialog.tsx` — replace the `<textarea>` with `<EditorContent editor={editor} />` from Tiptap, where `editor = useEditor({ extensions: [StarterKit, Link], content: "" })`. Submit `editor.getHTML()` as the `content` FormData value.
- Modify: `app/sun-kudos/_components/kudos-card.tsx` — render `item.message` as `dangerouslySetInnerHTML={{ __html: sanitize(item.message) }}` using the shared sanitize helper.
- New: `lib/sanitize-kudos-html.ts` — wraps DOMPurify with the project's allowed-tag/attr list.

## Allowed HTML elements
`<p>`, `<strong>`, `<em>`, `<s>`, `<ol>`, `<li>`, `<a href target rel>`, `<blockquote>`, `<br>`, `<span class="mention" data-id>`.

## Acceptance
- Type "Cảm ơn" → highlight → click B → text becomes bold; serialized HTML has `<strong>Cảm ơn</strong>`.
- Click Link → prompt for URL → text gains `<a href="..." target="_blank" rel="noopener">…</a>`.
- Feed renders the bold/italic/link text without raw HTML escaping.
- XSS attempt (e.g., pasting `<script>alert(1)</script>`) is stripped on both insert and render.

## Risks
- Tiptap adds ~50kb to the client bundle. Acceptable for this surface.
- Feed renderer change affects all existing kudos display (plain-text mock data wrapped in `<p>`). Verify all mock rows display correctly.

## Result
**Status:** Completed. New dependencies added: @tiptap/react, @tiptap/pm, @tiptap/starter-kit, @tiptap/extension-link, isomorphic-dompurify, tippy.js. New file: `lib/sanitize-kudos-html.ts` (DOMPurify wrapper with project allow-list). EditorToolbar wired to Tiptap editor instance. KudosWriteDialog uses useEditor hook with StarterKit + Link extension, excludes heading/horizontalRule/codeBlock per sanitizer. Content serialized as sanitized HTML on submit. KudosCard renders safe HTML via dangerouslySetInnerHTML with DOMPurify sanitization. Post-implementation, reviewer recommended stricter DOMPurify config (Medium #6) — added ALLOW_DATA_ATTR: false + explicit mention attrs.
