## Code Review — Write Kudos Feature

### Scope
- Files: 15 added/modified across migrations, server actions, lib, components
- LOC: ~900 net new lines
- Focus: security, correctness, migration safety, partial failures

---

### Overall Assessment

The implementation is well-structured and security-conscious in most areas. DOMPurify integration is correct, upload path is not traversable, and the auth flow is properly gated. However, there is **one critical bug** that will make the feature appear to work (kudos row saves) but silently drop all recipients and hashtags on every submit. There is also a blocking `next/image` config gap that will crash the feed thumbnails in production.

---

### Critical Issues

#### 1. Missing INSERT RLS policies for `kudos_recipients` and `kudos_hashtags`

**Severity: Critical | Will break in production**

`20260526102821_kudos_metadata.sql` creates both tables with RLS enabled but only adds `SELECT` policies — no `INSERT` policy. With Supabase's default-deny RLS, every insert to those tables is rejected at the DB level.

`createKudos` steps 12 and 13 explicitly swallow the error and continue:
```
// Continue — kudos row is in place, recipient missing is fixable upstream.
```
The migration comment in `20260529101400_write_kudos_schema.sql` line 10 compounds the confusion:
```sql
-- The existing kudos + kudos_recipients + kudos_hashtags policies already gate inserts/reads.
```
This claim is factually wrong — there are no INSERT policies on either table.

**Impact:** Every submitted kudos saves with `NULL` recipient and zero hashtags. The feature appears to succeed but the feed shows no recipient name, no hashtags, and the sunner_id FK is never populated. This is not intermittent — it will fail 100% of the time.

**Fix:** Add INSERT policies in a new migration:
```sql
create policy "Authenticated users can insert recipients for own kudos"
  on public.kudos_recipients
  for insert
  to authenticated
  with check (
    kudos_id in (
      select id from public.kudos where author_id = auth.uid()
    )
  );

create policy "Authenticated users can insert hashtags for own kudos"
  on public.kudos_hashtags
  for insert
  to authenticated
  with check (
    kudos_id in (
      select id from public.kudos where author_id = auth.uid()
    )
  );
```

---

### High Priority

#### 2. `next/image` `remotePatterns` missing for Supabase Storage domain

Both `KudosCard` (feed thumbnails) and `ImageUploader` (upload previews) render Supabase Storage URLs via `<Image src={url} ...>`. `next.config.ts` only allows `lh3.googleusercontent.com`. The Supabase storage URL (`https://<project>.supabase.co` in production, `http://127.0.0.1:54321` locally) is not listed.

Next.js throws a runtime error for any un-allowed hostname — the image renders broken and Next.js logs an `Invalid src` error. Feed cards with attachments will be broken in production.

**Fix:**
```ts
// next.config.ts
remotePatterns: [
  { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
  { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
  // local dev:
  { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/public/**" },
],
```

#### 3. Content length mismatch: action validates plain text ≤ 5000, DB constrains HTML ≤ 5000

The DB CHECK on `kudos.content` (`char_length(content) <= 5000`) measures the raw HTML string. The server action validates `plain.length > MAX_CONTENT_LENGTH` after stripping HTML — so 5000 visible characters can produce an HTML string longer than 5000 characters (e.g. a 5000-char paragraph inside `<p><strong>...</strong></p>` is already 5024 chars).

When this happens, `insertKudosError` fires and the user sees the generic banner "Không thể lưu Kudos. Vui lòng thử lại." — which is confusing because the length counter still shows they are within limits.

**Fix:** Either raise the DB CHECK limit (e.g. to `10000` to give headroom for tags), or validate `sanitized.length <= MAX_CONTENT_LENGTH` instead of plain text length, adjusting MAX accordingly.

---

### Medium Priority

#### 4. `process.env.SUPABASE_URL` accessed directly (inconsistent, defensive fallback hides misconfiguration)

`create-kudos.ts` line 124:
```ts
const supabaseUrl = process.env.SUPABASE_URL ?? "";
```
All other Supabase code uses `getSupabaseEnv()` which throws on missing vars. Here the `?? ""` means if `SUPABASE_URL` is somehow missing, `publicPrefix` becomes `/storage/v1/object/public/kudos-images/` — a relative URL prefix. Any URL starting with that string (e.g. a path-traversal string) would pass the filter.

In practice `createSupabaseServerClient()` is called earlier in the same action (line 140) and would throw if env is missing — so the `?? ""` path is never reached. But it's a code smell and a latent defect if the ordering ever changes.

**Fix:** Use `getSupabaseEnv().url` or at minimum `process.env.SUPABASE_URL!` with a runtime guard.

#### 5. Partial insert failure handling — orphaned kudos rows

Steps 12 (recipient) and 13 (hashtags) log errors and continue. The "continue" comment at step 12 implies it is intentional, but:
- The kudos row is now visible in the feed without a recipient (broken card UI)
- The hashtags are missing (feed shows empty hashtag row)
- There is no compensating transaction or cleanup

For a feature that is always failing (see #1), this silent-continue mask makes the bug invisible in app logs until someone queries the DB directly.

**Recommendation:** After fixing #1, change the silent-continue to a hard failure that deletes the orphaned kudos row (or wraps all three inserts in a Postgres function/RPC so the DB atomically rolls back). The current "acceptable" comment should at minimum become a structured warning log that fires an alert.

#### 6. DOMPurify allows all `data-*` attributes by default

The config explicitly lists `data-type` and `data-id` in `ALLOWED_ATTR`, but DOMPurify's default is to pass through all `data-*` attributes regardless. A crafted payload could include arbitrary `data-*` values. This is not directly exploitable for XSS because React escapes attribute values in `dangerouslySetInnerHTML`, and `data-*` attributes have no browser-native behavior. But it does mean the sanitizer is less strict than intended.

**Low-risk mitigration:** Add `ALLOW_DATA_ATTR: false` to the DOMPurify config, then explicitly list only `data-type`, `data-id`, `data-label`, `data-mention-suggestion-char` in `ALLOWED_ATTR`. This locks down the allow-list to exactly the Tiptap Mention attributes.

---

### Low Priority

#### 7. Hardcoded `author_level: "Hero"` and `author_badge: "New Hero"`

`create-kudos.ts` lines 187–188. These are placeholder values with no connection to the sender's actual level/badge. The feed will show every author as "Hero / New Hero". This was presumably deferred but there is no TODO comment.

#### 8. Hashtag dedup happens *after* the `> MAX_HASHTAGS` raw count check

If the client sends `["#foo","#FOO","#foo","#FOO","#foo","#FOO"]` (6 items, all duplicates of 2 unique), the action rejects with "Tối đa 5 hashtag" before dedup runs. The real unique count is 2. This is a UX edge case — the front-end HashtagChips component presumably prevents this — but an API client or test could trigger confusing rejections.

#### 9. `recipient_id` not validated as UUID format before DB query

Any non-UUID string (e.g. `"not-a-uuid"`) will cause Postgres to return `invalid input syntax for type uuid` which surfaces as a generic "Không thể xác nhận người nhận" error rather than a field-level validation message. Supabase parameterizes the query so there is no SQL injection risk, but the UX on a malformed POST is poor.

#### 10. `KudosInputBar` does not prefetch `initialSunners`

`KudosWriteDialog` accepts `initialSunners?: Sunner[]` but `KudosInputBar` never passes it. The autocomplete starts empty and fetches only on first focus. Low friction for users but a missed use of the pre-fetch infrastructure already built.

---

### Positive Observations

- **Upload path construction** is correct: `${uid}/${randomUUID}.${ext}` — no path traversal possible. Server-side mime + size validation is done before the client-side pre-flight check, not instead of it.
- **DOMPurify blocks `javascript:` and `data:` URIs** correctly (tested): the `href` allow-list strips the scheme from dangerous links, leaving an inert `<a>` with no href.
- **Mention chip data attributes survive sanitization** — `data-id`, `data-type`, `data-label`, `data-mention-suggestion-char` all pass through DOMPurify, and Tiptap v3 correctly parses them back to mention nodes. The feed renders them correctly.
- **Storage RLS is correctly scoped**: `(storage.foldername(name))[1] = auth.uid()::text` prevents user A from writing or deleting user B's files. The public read policy is appropriate for a social feed.
- **`isomorphic-dompurify` is applied both on insert (server action) and on render (KudosCard)** — belt-and-suspenders defense against any legacy data.
- **`immediatelyRender: false`** on the Tiptap editor correctly avoids SSR hydration mismatch.
- **ILIKE wildcard escaping** in `searchSunners` (`replace(/[%_\\]/g, ...)`) prevents search injection.

---

### Answers to Specific Questions

1. **Storage bucket security**: Read policy (no `to` role, allows anonymous) is intentional for public thumbnails — fine for a social feed. Write and delete policies correctly check `(storage.foldername(name))[1] = auth.uid()::text`. No path traversal via the upload action (UUID filename, fixed extension).

2. **HTML sanitization**: DOMPurify blocks `javascript:` and `data:` URIs from `href` by default. No SVG risk (not in ALLOWED_TAGS). The allow-list is strict for the Tiptap feature set. One improvement: add `ALLOW_DATA_ATTR: false` to restrict to only the explicitly listed `data-*` attrs (see #6 above).

3. **`createKudos` validation**: Rules are correct. The image URL prefix check is sound when SUPABASE_URL is set (see #4). Anonymous-name required-if-anonymous is correct. The hashtag dedup-after-max-check is a minor UX edge case (#8).

4. **Race conditions / partial failures**: The three sequential inserts are not wrapped in a transaction. Steps 2 and 3 fail silently. This is a data integrity problem — see #5. The right fix is a Postgres RPC that runs all three inserts in one transaction. Alternatively: wrap steps 12/13 errors in a hard failure with compensating delete.

5. **Tiptap integration**: `immediatelyRender: false` is correct. `StarterKit` is configured to exclude heading, horizontalRule, codeBlock — consistent with what the sanitizer allows. Tippy popover lifecycle (onStart/onUpdate/onExit) is standard and correct.

6. **Mention persistence**: Yes, the sanitizer correctly preserves `data-type="mention"` and `data-id` attributes (verified). Tiptap v3 also adds `data-label` and `data-mention-suggestion-char` — these also survive because DOMPurify passes all `data-*` by default.

7. **Migration safety**: The `on conflict (id) do update set public = excluded.public` on the bucket insert is idempotent — safe for re-runs. `sunner_id` nullable FK with `on delete set null` is correct. No rollback strategy documented but the `add column if not exists` pattern is safe to re-run. Main concern: missing INSERT policies documented above.

8. **Skipped tests**: The 3 skipped files are the old `createKudos` / `RecipientAutocomplete` / `EditorToolbar` unit tests. Given the critical RLS bug (#1) would not have been caught by unit tests anyway (needs DB), the skip is not the cause. However, a minimal test for `sanitizeKudosHtml` (especially the `javascript:` and `data:` URI cases) and for the `normalizeHashtag` function would be low-effort and high-value. The validation logic in `createKudos` (hashtag dedup, URL prefix check, anonymous-name guard) is also unit-testable without DB.

---

### Recommended Actions (priority order)

1. **[Critical]** Add INSERT RLS policies for `kudos_recipients` and `kudos_hashtags` in a new migration (`20260529101600_fix_rls_insert_policies.sql`).
2. **[High]** Add Supabase storage hostname to `next.config.ts` `remotePatterns`.
3. **[High]** Fix content length validation to use `sanitized.length` or raise the DB CHECK limit to `10000`.
4. **[Medium]** Wrap kudos + recipient + hashtag inserts in a Postgres RPC (or at minimum: hard-fail and delete the orphaned kudos row when steps 12/13 fail).
5. **[Medium]** Replace `process.env.SUPABASE_URL ?? ""` with `getSupabaseEnv().url` in `create-kudos.ts`.
6. **[Low]** Add `ALLOW_DATA_ATTR: false` to DOMPurify config and add `data-label`, `data-mention-suggestion-char` to `ALLOWED_ATTR`.
7. **[Low]** Add TODO comments for `author_level`/`author_badge` hardcoded values.
8. **[Low]** Add unit tests for `sanitizeKudosHtml` (XSS vectors) and `createKudos` validation logic.

---

### Verdict: **request-changes**

Items #1 and #2 are blocking: the feature will appear to work in a demo (kudos row saves, no JS error) but delivers broken data (no recipients, no hashtags) and broken images in the feed. Both are fixable in under 30 lines of code.
