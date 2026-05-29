# Phase 02 — Rewrite `createKudos` server action

## Goal
Expand the action to accept every field from the dialog, validate, then write to `kudos`, `kudos_recipients`, and `kudos_hashtags` in sequence (best-effort; no real transaction unless we use an RPC).

## File
- Modify: `app/sun-kudos/_actions/create-kudos.ts`

## New FormData fields the action reads
| FormData key | Type | Required | Notes |
|---|---|---|---|
| `content` | string | ✓ | Already supported. Now stores HTML (sanitized server-side). |
| `recipient_id` | string (uuid) | ✓ | Sunner UUID picked from autocomplete. |
| `honor_title` | string | optional | Max 200 chars. |
| `is_anonymous` | "true" / "false" | optional | Default false. |
| `anonymous_name` | string | optional, required-if-anonymous | Max 80 chars. |
| `hashtags` | string (JSON array) | ✓ | 1..5 items, each ≤ 30 chars after `#` strip. |
| `images` | string (JSON array of URLs) | optional | 0..5 URLs already uploaded to Storage. |

## Validation rules
- `recipient_id` must exist in `sunners` (single SELECT round-trip).
- `content` non-empty after sanitization (strip tags → trim → length>0).
- `hashtags` parsed as JSON array; 1 ≤ len ≤ 5; deduped; each tag normalized to `#xxx`.
- `images` parsed as JSON array; len ≤ 5; each URL must start with `${SUPABASE_URL}/storage/v1/object/public/kudos-images/`.
- `is_anonymous=true` ⇒ `anonymous_name` non-empty.

## Write order
1. INSERT `kudos` (content sanitized, honor_title, is_anonymous, anonymous_name, author_name/avatar/level/badge from auth user, images array) → returns `id`.
2. INSERT `kudos_recipients` (kudos_id=id, sunner_id, denorm name/level/badge/avatar/department from sunners row).
3. Bulk-INSERT `kudos_hashtags` (one row per hashtag).
4. Best-effort: if step 2 or 3 fails, log + return ok=false; row in step 1 is orphan noise.

## Sanitization
- Use `isomorphic-dompurify` (added as dep in phase 06) — keep the allowed-tag list small: `<p>`, `<strong>`, `<em>`, `<s>`, `<ol>`, `<li>`, `<blockquote>`, `<a href>`, `<span class="mention">`.

## Acceptance
- Action accepts the full payload and writes to all three tables.
- Validation errors come back as the existing `CreateKudosResult` shape (`{ ok: false, error: string }`).
- Existing E2E `write-kudos.spec.ts` continues to pass (it submits with content only — the action must remain tolerant of missing optional fields). Per clarifications the recipient now REQUIRED — E2E spec will need a small update.

## Result
**Status:** Completed with critical fix applied. Action fully rewritten to handle all FormData fields (content, recipient_id, honor_title, is_anonymous, anonymous_name, hashtags, images). Validation rules enforced per spec. Server-side HTML sanitization via DOMPurify. INSERT to kudos, kudos_recipients, and kudos_hashtags. Post-implementation, reviewer identified missing INSERT RLS policies (Critical #1) — fixed in migration `20260529101600_write_kudos_rls_inserts.sql`. Content length validation corrected to measure sanitized HTML (High #3). UUID validation added to recipient_id (Low #9).
