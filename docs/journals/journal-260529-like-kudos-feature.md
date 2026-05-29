# Like-Kudos Feature Shipped

**Date:** 2026-05-29
**Severity:** Low
**Component:** `sun-kudos` like flow (schema, server action, optimistic UI)
**Status:** Resolved

## What Happened

Shipped the like toggle for kudos cards: a `kudos_likes` join table, a `likes_count` denormalized counter on `kudos`, a sync trigger, a new server action `toggleKudosLike`, and an optimistic UI update in `KudosActionBar`. Like state persists across page reloads via an extended `fetchAllKudos` query.

## Schema Changes (new migration)

- **`kudos_likes` table** — join table: `kudos_id` (FK → `kudos.id ON DELETE CASCADE`), `user_id` (FK → `auth.users.id ON DELETE CASCADE`), `created_at`. Composite PK `(kudos_id, user_id)` enforces one-like-per-user at the database level — no application-layer dedup needed.
- **`kudos.likes_count`** — INT NOT NULL DEFAULT 0. Denormalized counter kept in sync by a BEFORE INSERT / AFTER DELETE trigger on `kudos_likes`.
- **RLS** — INSERT and DELETE gated to `auth.uid() = user_id`; SELECT is open to authenticated users.

## Denormalized Counter Pattern

The `likes_count` column trades write complexity for read simplicity. A normalized alternative — `SELECT COUNT(*) FROM kudos_likes WHERE kudos_id = $1` — runs on every feed render; the counter means a single column read regardless of total likes.

**Why a trigger over an application increment:**

- Concurrent increments from two sessions would race on an application-level `UPDATE kudos SET likes_count = likes_count + 1`. The trigger runs inside the same transaction as the `INSERT`/`DELETE`, so the counter is always consistent with the join table — even if a client crashes mid-request or a batch import runs outside the server action.
- The downside: triggers are invisible to application developers reading only the server action code. Document them; don't discover them in production.

**Counter drift risk:** If `kudos_likes` rows are ever deleted by a DBA directly (bypassing the trigger), `likes_count` will drift. A periodic reconciliation query — `UPDATE kudos SET likes_count = (SELECT COUNT(*) FROM kudos_likes WHERE kudos_id = kudos.id)` — can heal it. Not automated today.

## Server Action: `toggleKudosLike`

Idempotent toggle: tries `INSERT`; on `23505` (unique violation) falls back to `DELETE`. This avoids a SELECT-then-write race and keeps the action safe to retry.

UUID validation runs before the Supabase call — malformed IDs return early without touching the database.

Auth is checked server-side via `createServerSupabaseClient`; the RLS policy is the final backstop.

## `fetchAllKudos` Extension

Now accepts a `userId` parameter. When provided, a left-join against `kudos_likes` returns `likedByMe: boolean` per row. When `userId` is null (unauthenticated), `likedByMe` defaults to `false` — no query change needed for the anonymous case.

## Optimistic UI in `KudosActionBar`

`useTransition` wraps the server action call. On click:

1. Local state flips immediately (optimistic).
2. `startTransition` fires `toggleKudosLike` in the background.
3. On error, state reverts and a toast shows `sun_kudos.card.like_failed`.

**Tradeoffs:**

- No rollback on network timeout — the action is idempotent, so a retry on the next click self-heals rather than double-counting.
- `isPending` disables the button during the transition, preventing double-clicks from firing two concurrent requests.
- State is local to the component; a full page reload re-derives truth from `likedByMe` in the server-fetched data. No stale optimistic state survives navigation.

**What this doesn't handle:** real-time sync. If two browser tabs are open and the user likes from one, the count on the other tab won't update until a refresh. Acceptable for this stage; Supabase Realtime subscriptions would fix it later.

## i18n

One new key: `sun_kudos.card.like_failed` — error toast copy shown on action failure. Added to all locale files.
