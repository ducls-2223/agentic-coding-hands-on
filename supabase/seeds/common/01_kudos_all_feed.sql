-- Seed: 8 entries for the Sun* Kudos "All Kudos" feed.
-- Mirrors ALL_KUDOS in app/sun-kudos/_data/kudos-mock.ts.
-- author_id is NULL on purpose (seed authors are not real auth.users).
-- created_at is backdated to preserve the "5 phút trước", "15 phút trước",
-- "45 phút trước", "1 giờ trước", etc. labels rendered by the relative-time helper.

insert into public.kudos (
  id, author_id, content, author_name, author_avatar, author_level, author_badge, images, created_at
) values
  (
    '11111111-1111-1111-1111-000000000001',
    null,
    'Cảm ơn bạn đã hoàn thành feature mới nhanh và chính xác. Công việc của bạn giúp cả team tiến độ rất tốt trong sprint này. Tinh thần trách nhiệm của bạn thật đáng trân trọng!',
    'Mai Phương Thúy', '/kudos/avatars/sender.png', 'CEVC9', 'Legend Hero',
    array['/kudos/gallery-placeholder.png'],
    now() - interval '5 minutes'
  ),
  (
    '11111111-1111-1111-1111-000000000002',
    null,
    'Bạn đã xử lý bug production rất nhanh và hiệu quả. Nhờ đó chúng ta tránh được downtime kéo dài. Cảm ơn bạn vì sự phản ứng nhanh nhẹn và chuyên nghiệp!',
    'Nguyễn Hoàng Linh', '/kudos/avatars/feed-1.png', 'CEVC8', 'New Hero',
    array['/kudos/gallery-placeholder.png', '/kudos/gallery-placeholder.png'],
    now() - interval '15 minutes'
  ),
  (
    '11111111-1111-1111-1111-000000000003',
    null,
    'Thiết kế UI/UX của bạn rất đẹp và user-friendly. Khách hàng phản hồi tích cực về trải nghiệm mới. Cảm ơn bạn vì sự sáng tạo và tư duy thiết kế xuất sắc!',
    'Nguyễn Bá Chức', '/kudos/avatars/feed-3.png', 'CEVC10', 'Legend Hero',
    null,
    now() - interval '45 minutes'
  ),
  (
    '11111111-1111-1111-1111-000000000004',
    null,
    'Cảm ơn bạn đã review code rất kỹ và đưa ra nhiều gợi ý hữu ích. Nhờ đó code chất lượng hơn rất nhiều. Sự tỉ mỉ và hiểu biết sâu của bạn thực sự giúp ích cho cả team.',
    'Đỗ Hoàng Hiệp', '/kudos/avatars/sender.png', 'CEVC8', 'Hero',
    array['/kudos/gallery-placeholder.png'],
    now() - interval '1 hour'
  ),
  (
    '11111111-1111-1111-1111-000000000005',
    null,
    'Bạn đã dẫn dắt meeting kỹ thuật rất tốt. Mọi người đều hiểu rõ hướng giải quyết và có thể bắt tay vào làm ngay. Kỹ năng lãnh đạo của bạn thật đáng học hỏi!',
    'Lê Kiều Trang', '/kudos/avatars/feed-1.png', 'CEVC6', 'New Hero',
    null,
    now() - interval '2 hours'
  ),
  (
    '11111111-1111-1111-1111-000000000006',
    null,
    'Cảm ơn bạn đã hỗ trợ mình debug issue khó hôm qua. Kiến thức về hệ thống của bạn thật sâu rộng. Mình rất biết ơn vì bạn đã dành thời gian giải thích tận tình cho mình.',
    'Nguyễn Văn Quy', '/kudos/avatars/feed-3.png', 'CEVC5', 'Hero',
    array['/kudos/gallery-placeholder.png', '/kudos/gallery-placeholder.png', '/kudos/gallery-placeholder.png'],
    now() - interval '3 hours'
  ),
  (
    '11111111-1111-1111-1111-000000000007',
    null,
    'Bạn đã viết documentation rất chi tiết và dễ hiểu. Nhờ đó team mới onboard rất nhanh chóng. Cảm ơn bạn vì tinh thần chia sẻ kiến thức tuyệt vời!',
    'Dương Thúy An', '/kudos/avatars/sender.png', 'CEVC7', 'Legend Hero',
    null,
    now() - interval '5 hours'
  ),
  (
    '11111111-1111-1111-1111-000000000008',
    null,
    'Cảm ơn bạn đã luôn hỗ trợ QA process và tìm ra những bug quan trọng trước khi release. Sự tỉ mỉ của bạn giúp sản phẩm chất lượng hơn rất nhiều. Teamwork tuyệt vời!',
    'Mai Phương Thúy', '/kudos/avatars/feed-1.png', 'CEVC9', 'New Hero',
    array['/kudos/gallery-placeholder.png'],
    now() - interval '8 hours'
  )
on conflict (id) do nothing;

insert into public.kudos_recipients (kudos_id, name, level, badge, avatar, department) values
  ('11111111-1111-1111-1111-000000000001', 'Lê Kiều Trang',     'CEVC6',  'Hero',         '/kudos/avatars/receiver.png', 'CEVC1'),
  ('11111111-1111-1111-1111-000000000002', 'Nguyễn Văn Quy',    'CEVC5',  'Hero',         '/kudos/avatars/feed-2.png',   'OPD'),
  ('11111111-1111-1111-1111-000000000003', 'Dương Thúy An',     'CEVC7',  'New Hero',     '/kudos/avatars/feed-4.png',   'CEVC2'),
  ('11111111-1111-1111-1111-000000000004', 'Mai Phương Thúy',   'CEVC9',  'Legend Hero',  '/kudos/avatars/receiver.png', 'CEVC4'),
  ('11111111-1111-1111-1111-000000000005', 'Nguyễn Bá Chức',    'CEVC10', 'Legend Hero',  '/kudos/avatars/feed-2.png',   'CEVC3'),
  ('11111111-1111-1111-1111-000000000006', 'Nguyễn Hoàng Linh', 'CEVC8',  'New Hero',     '/kudos/avatars/feed-4.png',   'CEVC2'),
  ('11111111-1111-1111-1111-000000000007', 'Đỗ Hoàng Hiệp',     'CEVC8',  'Hero',         '/kudos/avatars/receiver.png', 'Infra'),
  ('11111111-1111-1111-1111-000000000008', 'Lê Kiều Trang',     'CEVC6',  'Hero',         '/kudos/avatars/feed-2.png',   'CEVC1')
on conflict (kudos_id) do nothing;

insert into public.kudos_hashtags (kudos_id, hashtag) values
  ('11111111-1111-1111-1111-000000000001', '#Dedicated'),
  ('11111111-1111-1111-1111-000000000001', '#Teamwork'),
  ('11111111-1111-1111-1111-000000000002', '#Inspiring'),
  ('11111111-1111-1111-1111-000000000002', '#Dedicated'),
  ('11111111-1111-1111-1111-000000000003', '#Creative'),
  ('11111111-1111-1111-1111-000000000003', '#Inspiring'),
  ('11111111-1111-1111-1111-000000000004', '#Mentor'),
  ('11111111-1111-1111-1111-000000000004', '#Teamwork'),
  ('11111111-1111-1111-1111-000000000005', '#Mentor'),
  ('11111111-1111-1111-1111-000000000005', '#Inspiring'),
  ('11111111-1111-1111-1111-000000000006', '#Dedicated'),
  ('11111111-1111-1111-1111-000000000006', '#Mentor'),
  ('11111111-1111-1111-1111-000000000007', '#Teamwork'),
  ('11111111-1111-1111-1111-000000000007', '#Dedicated'),
  ('11111111-1111-1111-1111-000000000008', '#Creative'),
  ('11111111-1111-1111-1111-000000000008', '#Teamwork')
on conflict (kudos_id, hashtag) do nothing;
