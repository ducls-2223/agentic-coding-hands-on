# Kudos All-Feed Shipped — A Clean Migration

**Date:** 2026-05-26 11:04
**Severity:** Low
**Component:** `sun-kudos` feed (Supabase integration)
**Status:** Resolved

## What Happened

Migrated the `/sun-kudos` "All Kudos" feed from hard-coded `ALL_KUDOS` mock array to Supabase. The 8 seed entries preserve the exact visible behavior — same cards, same relative timestamps, same render shape.

## The Reality

This was textbook: plan → implement → review → ship. No surprises, no late-night debugging, no "why didn't we test this first" moments. The kind of session where the plan covered edge cases upfront, so the code just landed.

## Technical Details

- Schema: relaxed `author_id` to NULLABLE (so seed rows don't need fake `auth.users`), denormalized author display columns onto `kudos`, added `kudos_recipients` (1:1 PK) and `kudos_hashtags` (composite PK) tables.
- Seed: 8 rows with backdated `created_at` to preserve the mock ordering/labels.
- Fetcher: nested `kudos_recipients!inner` select filters out user-created kudos without a recipient yet — matches the prior "only show complete records" behavior.
- Verification: `supabase db reset` (8/8/16 rows), `npm run build`, `npm run lint` — all clean.

## One Learning

The original `author_id` INSERT RLS policy used SQL's three-valued logic: `(author_id = auth.uid())` silently rejects `NULL` values because `NULL = anything` yields `NULL`, not `TRUE`. This is safe but cryptic. Reviewer flagged it; I tightened it to explicit `(author_id is not null and author_id = auth.uid())`. Same effect, clearer intent. Write-time clarity beats post-hoc review.

## What Worked

Auto-mode plan (user answered scoping Q upfront). No schema guessing. No UI refactor needed — `<KudosCard>` interface already compatible. Pragmatic call on denormalization (avoid seeding `auth.users` with fake rows) paid off.

## Unresolved Pattern

The doc-writer flagged `docs_missing` eight times in this plan phase alone. The patterns (force-dynamic convention, RLS trust boundaries, Supabase nested-select idioms, useCallback memoization, IntersectionObserver scroll races, gradient-mask artwork) are project lore — living in journals and plan outcomes, not in a centralized docs. Not a blocker for this session, but worth noting.

## Next Steps

None blocking this session. Pattern documentation deferred to a future housekeeping phase.

---

**Status:** DONE
**Summary:** Kudos All-Feed shipped clean — mock array replaced with Supabase, 8 seed entries render identical to prior behavior, all checks pass.
