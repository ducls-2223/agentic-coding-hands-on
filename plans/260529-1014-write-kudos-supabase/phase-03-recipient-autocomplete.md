# Phase 03 — Supabase-backed Recipient Autocomplete

## Goal
Replace the static `SUNNERS` array in `recipient-autocomplete.tsx` with a real Supabase fetch.

## Files
- New: `app/sun-kudos/_lib/fetch-sunners.ts` — `getSunners(): Promise<Sunner[]>` calling the SSR client.
- New: `app/sun-kudos/_actions/search-sunners.ts` — server action accepting `query` and returning filtered Sunner[]. Avoids loading all rows client-side.
- Modify: `app/sun-kudos/_components/recipient-autocomplete.tsx` — accept `value` as the Sunner id; render label = name; query server action on input change (debounced).
- Modify: `kudos-write-dialog.tsx` — pass selected `recipient_id` into FormData.

## Type
```ts
export interface Sunner {
  id: string;
  name: string;
  level: string;
  badge: string;
  avatar: string | null;
  department: string | null;
}
```

## UX
- On focus, show top 10 Sunners (no filter).
- On typing, debounce 200ms, call `search-sunners` server action with `query`.
- Selecting a row sets `recipient_id` (uuid) AND displays the Sunner's name in the input.

## Acceptance
- Picking a Sunner persists their UUID into FormData.
- Empty input shows the top-N most recent or alphabetical Sunners.
- "@ # $" → autocomplete trim handles non-letter characters gracefully (per test case ID-9).

## Result
**Status:** Completed. New files created: `fetch-sunners.ts` (Supabase query wrapper), `search-sunners.ts` (server action with ILIKE wildcard escaping). RecipientAutocomplete rewritten to accept Sunner UUID value, render names, debounced query on input. KudosWriteDialog wired to pass selected `recipient_id` into FormData. Autocomplete correctly handles empty input and special characters per spec.
