# Like-Kudos Feature: Process & Workflow Lessons

**Date:** 2026-05-29 15:38
**Component:** Like-kudos implementation workflow
**Status:** Resolved

## What Worked

**Four-phase split mirrored natural data flow:** schema → server action → read-path extension → UI + transitions. Each phase stayed under 100 LOC diff, reviews took minutes instead of hours.

**Migration debt prevention:** Previous session ended with "user can't save" — root cause was deferred Supabase migrations on `npm run dev`. Fixed by adding `predev: supabase migration up || true` to package.json. Fresh checkouts and mid-sprint migrations now auto-apply. This gate prevents ~1 hour of "why doesn't it work locally" debugging per developer.

**Race-condition pattern via unique-violation catch:** The `23505` composite-PK check in `toggleKudosLike` avoids a SELECT-then-write race without needing UPSERT RPC or application-layer locking. Pattern is: try INSERT, catch unique violation as "already exists", DELETE to toggle. Lighter and correct under the constraint model.

## Invisible Bugs Caught by Reviewer

(1) **`revalidatePath` on `force-dynamic` route is dead code today.** But if static caching lands in Next.js, it becomes a cache-thrashing footgun. Removed preemptively.

(2) **Duplicate `getUser()` per feed render.** Each `KudosCard` calls `getUser(userId)` even though the card was already fetched from `fetchAllKudos`. Wasted auth round-trip per like-toggle. Fixed by passing user object down via props — 5 minutes to fix, invisible without architecture review.

**Lesson:** Lint and tests catch syntax; only architecture review catches data-flow waste and time-bombs. Reviewer attention = architectural tax.

## Process Bottleneck: Test Debt

This branch (`feat/write-kudos`) was created before the test suite landed on main. Zero test coverage on the entire feature. Added manual smoke tests to the implementation; none written. Next session must backfill unit + integration tests or risk regression during refactor.

## Workflow Observation

Smaller PRs (4 phases, ~6 files) reviewed faster and absorbed feedback cleaner than the monolithic write-kudos implementation from previous session. Confirm the rule: scope down, ship incrementally, review stays tight.

## Denormalized Counter Trade-off

The `likes_count` trigger pattern adds invisible complexity — developers reading only the server action won't see the sync mechanism. Root cause: trigger logic is not colocated with the action. Mitigated by inline comment in `toggleKudosLike` pointing to the migration. Worth revisiting if counter-sync bugs emerge; consider RPC-wrapped upsert as alternative.

## Next Obligations

- Backfill tests for like-toggle logic (server action, trigger, RLS).
- Real-time sync via Supabase Realtime (blocked on test infrastructure).
- Counter reconciliation query for DBA-induced drift (low priority).
