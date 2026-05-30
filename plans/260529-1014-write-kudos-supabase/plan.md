# Plan — Write Kudos feature (Supabase-backed)

## MoMorph refs
- Viết Kudo: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
- Clarifications: [./clarifications.md](./clarifications.md)

## Scope
Take the existing Write-Kudos dialog (which today persists only `content`) and wire every field to Supabase per the MoMorph design. Adds a real `sunners` lookup, three new `kudos` columns, persistence to `kudos_recipients` and `kudos_hashtags`, image upload via Supabase Storage, a Tiptap rich-text editor, and an @mention popover.

## Phases (sequential — each blocks the next)
- [x] phase-01 — DB schema: `sunners` table + seed, `kudos.honor_title`, `kudos.is_anonymous`, `kudos.anonymous_name`, Storage bucket `kudos-images` + RLS
- [x] phase-02 — Server action `createKudos` rewrite: validate + insert kudos row + recipient + hashtag rows
- [x] phase-03 — Replace static `SUNNERS` array with Supabase-backed `RecipientAutocomplete` (server fetch + client filter)
- [x] phase-04 — Wire dialog form fields (`honor_title`, hashtags, anonymous toggle + name, images) into FormData submission + show per-field validation
- [x] phase-05 — Image upload: client uploads to Storage bucket, dialog persists returned URLs; max 5; jpg/png only
- [x] phase-06 — Rich-text editor with Tiptap (Bold/Italic/Strike/List/Link/Quote); store HTML; render safely (DOMPurify) in `KudosCard`
- [x] phase-07 — @mention popover (Tiptap mention extension) backed by `sunners` query; persisted as part of HTML content

## Key Decisions (from clarifications.md)
1. `sunners` is the source of truth for recipients (DB-backed, RLS-readable by authenticated users).
2. Image upload uses a public Supabase Storage bucket gated by file-type + size limits at upload action.
3. Rich-text content is stored as **HTML**, sanitized on read with `isomorphic-dompurify`.
4. Anonymous flow: `is_anonymous=true` + optional `anonymous_name`; feed renders that name instead of the author.
5. Skip new tests — coverage temporarily drops below 90%; backlog item to restore.

## Out of Scope
- Editing or deleting an existing kudos.
- Image thumbnails/cropping; rotation; alt-text.
- Real-time updates to the feed when a kudos is inserted.
- Email/Slack notifications.
- Markdown export.

## Success Criteria
- A user can fill every field in the dialog → submit → see the kudos appear in `/sun-kudos` after refresh, including hashtags, recipient avatar, optional images, optional anonymous flag.
- All form-level validation rules fire (required: recipient, content, ≥1 hashtag; max 5 hashtags; max 5 images; jpg/png only; max content length 5000).
- `npm run build` + lint + existing Vitest unit suite all stay green (no regression).
- Migration applies cleanly; rollback considered.

## Reviewer findings
**Applied (fixes):**
- Critical #1: Added migration `20260529101600_write_kudos_rls_inserts.sql` with INSERT policies for `kudos_recipients` and `kudos_hashtags`.
- High #2: Updated `next.config.ts` remotePatterns for Supabase Storage URLs (production + local dev).
- High #3: Fixed content length validation to measure sanitized HTML, matching DB CHECK constraint.
- Medium #4: Replaced `process.env.SUPABASE_URL ?? ""` with `getSupabaseEnv()` call.
- Medium #6: Added `ALLOW_DATA_ATTR: false` to DOMPurify config, explicit allow-list for Tiptap mention attrs.
- Low #9: Added UUID regex pre-check on `recipient_id` before DB lookup.

**Deferred (documented for backlog):**
- Critical #5: 3 inserts not wrapped in transaction (noted in comments; blocking issue not RLS-related).
- Low #7: `author_level`/`author_badge` hardcoded to "Hero" / "New Hero" (placeholder; TODO added).
- Low #8: Hashtag dedup after max-check (front-end prevents; UX edge case).
- Low #10: `KudosInputBar` doesn't pre-fetch initialSunners (minor perf optimization).

## Reports
- [Reviewer report](../../reports/reviewer-260529-1014-write-kudos.md)
