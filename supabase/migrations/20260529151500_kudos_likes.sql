-- Like-Kudos feature: per-user like rows + denormalized counter + sync trigger.
--
-- Design: one row in `kudos_likes` per (user, kudos) pair. Composite PK
-- enforces a single like per user per kudos. A trigger keeps
-- `kudos.likes_count` in lockstep so the feed renderer can read the counter
-- without an aggregate join.

create table if not exists public.kudos_likes (
  kudos_id   uuid not null references public.kudos (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (kudos_id, user_id)
);

create index if not exists kudos_likes_user_id_idx on public.kudos_likes (user_id);

alter table public.kudos_likes enable row level security;

drop policy if exists "Authenticated users can read kudos_likes" on public.kudos_likes;
create policy "Authenticated users can read kudos_likes"
  on public.kudos_likes
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert their own kudos_likes" on public.kudos_likes;
create policy "Authenticated users can insert their own kudos_likes"
  on public.kudos_likes
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Authenticated users can delete their own kudos_likes" on public.kudos_likes;
create policy "Authenticated users can delete their own kudos_likes"
  on public.kudos_likes
  for delete
  to authenticated
  using (user_id = auth.uid());

-- Denormalized counter on kudos. CHECK and the trigger's `greatest(...,0)`
-- are intentional double-protection: greatest() avoids writing a negative
-- value at the trigger layer; CHECK rejects it at the row layer if the
-- trigger is ever bypassed (manual SQL, schema migration). Both kept.
alter table public.kudos
  add column if not exists likes_count integer not null default 0
    check (likes_count >= 0);

-- Sync trigger. greatest(...,0) is defensive in case a DELETE fires for a
-- kudos whose counter is already at zero (e.g. dev DB reset between runs).
create or replace function public.kudos_likes_sync_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.kudos
       set likes_count = likes_count + 1
     where id = new.kudos_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.kudos
       set likes_count = greatest(likes_count - 1, 0)
     where id = old.kudos_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists kudos_likes_sync_count_trg on public.kudos_likes;
create trigger kudos_likes_sync_count_trg
  after insert or delete on public.kudos_likes
  for each row execute function public.kudos_likes_sync_count();
