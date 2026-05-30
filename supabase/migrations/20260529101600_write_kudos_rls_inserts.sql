-- Write-Kudos feature: INSERT RLS for kudos_recipients + kudos_hashtags.
--
-- The earlier metadata migration enabled RLS + SELECT-only policies on these
-- tables. Without INSERT policies the default-deny silently rejects every
-- write from createKudos. This migration closes that gap: a row may be
-- inserted iff the caller owns the parent kudos row.

drop policy if exists "Authenticated users can insert kudos recipients" on public.kudos_recipients;
create policy "Authenticated users can insert kudos recipients"
  on public.kudos_recipients
  for insert
  to authenticated
  with check (
    kudos_id in (
      select id from public.kudos where author_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can insert kudos hashtags" on public.kudos_hashtags;
create policy "Authenticated users can insert kudos hashtags"
  on public.kudos_hashtags
  for insert
  to authenticated
  with check (
    kudos_id in (
      select id from public.kudos where author_id = auth.uid()
    )
  );
