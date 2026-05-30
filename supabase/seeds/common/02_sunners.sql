-- Seed the sunners directory with the 7 demo names previously hard-coded
-- in app/sun-kudos/_components/recipient-autocomplete.tsx, plus 1 extra
-- so the list matches the All-Kudos feed authors.
--
-- Idempotent: ON CONFLICT (id) DO NOTHING. Fixed UUIDs let the feed seed
-- and tests reference these rows by name.

insert into public.sunners (id, name, level, badge, avatar, department)
values
  ('22222222-2222-2222-2222-000000000001', 'Nguyễn Bá Chức',    'CEVC10', 'Legend Hero', '/kudos/avatars/feed-3.png',  'STVC - R&D'),
  ('22222222-2222-2222-2222-000000000002', 'Đỗ Hoàng Hiệp',     'CEVC8',  'Hero',        '/kudos/avatars/sender.png',  'STVC - PMO'),
  ('22222222-2222-2222-2222-000000000003', 'Dương Thúy An',     'CEVC7',  'New Hero',    '/kudos/avatars/receiver.png','STVC - HR'),
  ('22222222-2222-2222-2222-000000000004', 'Mai Phương Thúy',   'CEVC9',  'Legend Hero', '/kudos/avatars/sender.png',  'STVC - QA'),
  ('22222222-2222-2222-2222-000000000005', 'Lê Kiều Trang',     'CEVC6',  'New Hero',    '/kudos/avatars/feed-2.png',  'STVC - R&D'),
  ('22222222-2222-2222-2222-000000000006', 'Nguyễn Hoàng Linh', 'CEVC8',  'New Hero',    '/kudos/avatars/feed-1.png',  'STVC - PMO'),
  ('22222222-2222-2222-2222-000000000007', 'Nguyễn Văn Quy',    'CEVC5',  'New Hero',    '/kudos/avatars/feed-4.png',  'STVC - HR'),
  ('22222222-2222-2222-2222-000000000008', 'Phạm Thị Bình',     'CEVC6',  'Hero',        '/kudos/avatars/receiver.png','STVC - QA')
on conflict (id) do nothing;
