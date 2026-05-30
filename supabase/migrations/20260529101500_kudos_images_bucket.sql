-- Write-Kudos feature: Supabase Storage bucket for kudos image attachments.
--
-- Bucket: `kudos-images` (public read so feed thumbnails work without signing).
-- Insert: only authenticated users, into a path prefixed by their auth.uid().
-- Delete: only the owner of the path prefix.

insert into storage.buckets (id, name, public)
  values ('kudos-images', 'kudos-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read of kudos images" on storage.objects;
create policy "Public read of kudos images"
  on storage.objects
  for select
  using (bucket_id = 'kudos-images');

drop policy if exists "Authenticated users can upload their own kudos images" on storage.objects;
create policy "Authenticated users can upload their own kudos images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'kudos-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can delete their own kudos images" on storage.objects;
create policy "Authenticated users can delete their own kudos images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'kudos-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
