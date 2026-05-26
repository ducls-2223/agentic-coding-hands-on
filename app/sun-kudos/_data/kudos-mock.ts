export interface KudosPerson {
  name: string;
  level: string;
  badge: string;
  avatar: string;
}

export interface KudosItem {
  id: string;
  sender: KudosPerson;
  receiver: KudosPerson;
  message: string;
  hashtags: string[];
  likes: number;
  timestamp: string;
  images?: string[];
}

export interface LeaderboardItem {
  rank: number;
  name: string;
  level: string;
  avatar: string;
  note: string;
}

export interface UserStats {
  received: number;
  sent: number;
  hearts: number;
  secretBoxOpened: number;
  secretBoxUnopened: number;
}

// Avatar pool cycling
const AVATARS = [
  "/kudos/avatars/sender.png",
  "/kudos/avatars/receiver.png",
  "/kudos/avatars/feed-1.png",
  "/kudos/avatars/feed-2.png",
  "/kudos/avatars/feed-3.png",
  "/kudos/avatars/feed-4.png",
];

const av = (i: number) => AVATARS[i % AVATARS.length];

export const HIGHLIGHT_KUDOS: KudosItem[] = [
  {
    id: "hk-001",
    sender: { name: "Nguyễn Bá Chức", level: "CEVC10", badge: "New Hero", avatar: av(0) },
    receiver: { name: "Đỗ Hoàng Hiệp", level: "CEVC8", badge: "Legend Hero", avatar: av(1) },
    message:
      "Cảm ơn bạn đã luôn hỗ trợ team trong suốt sprint vừa qua. Nhờ sự tận tâm và chuyên nghiệp của bạn mà chúng ta hoàn thành dự án đúng hạn. Thật sự trân trọng tinh thần teamwork của bạn!",
    hashtags: ["#Dedicated", "#Teamwork"],
    likes: 12,
    timestamp: "10 phút trước",
  },
  {
    id: "hk-002",
    sender: { name: "Dương Thúy An", level: "CEVC7", badge: "Hero", avatar: av(2) },
    receiver: { name: "Mai Phương Thúy", level: "CEVC9", badge: "New Hero", avatar: av(3) },
    message:
      "Bạn là nguồn cảm hứng lớn cho cả team. Cách bạn xử lý vấn đề kỹ thuật phức tạp và chia sẻ kiến thức thật tuyệt vời. Mình học được rất nhiều từ bạn mỗi ngày làm việc cùng nhau.",
    hashtags: ["#Inspiring", "#Mentor"],
    likes: 8,
    timestamp: "30 phút trước",
  },
  {
    id: "hk-003",
    sender: { name: "Lê Kiều Trang", level: "CEVC6", badge: "Hero", avatar: av(4) },
    receiver: { name: "Nguyễn Hoàng Linh", level: "CEVC8", badge: "Legend Hero", avatar: av(5) },
    message:
      "Cảm ơn bạn đã luôn có mặt và hỗ trợ kịp thời mỗi khi team gặp khó khăn. Sự sáng tạo và khả năng giải quyết vấn đề của bạn thật đáng ngưỡng mộ. Rất vui được làm việc cùng bạn!",
    hashtags: ["#Creative", "#Inspiring"],
    likes: 15,
    timestamp: "1 giờ trước",
  },
  {
    id: "hk-004",
    sender: { name: "Nguyễn Văn Quy", level: "CEVC5", badge: "New Hero", avatar: av(0) },
    receiver: { name: "Nguyễn Bá Chức", level: "CEVC10", badge: "Legend Hero", avatar: av(1) },
    message:
      "Bạn đã hỗ trợ mình rất nhiều trong quá trình onboarding. Kiến thức sâu rộng và sự nhiệt tình của bạn giúp mình nhanh chóng hòa nhập vào dự án. Cảm ơn bạn rất nhiều!",
    hashtags: ["#Mentor", "#Dedicated"],
    likes: 20,
    timestamp: "2 giờ trước",
  },
  {
    id: "hk-005",
    sender: { name: "Đỗ Hoàng Hiệp", level: "CEVC8", badge: "Hero", avatar: av(2) },
    receiver: { name: "Dương Thúy An", level: "CEVC7", badge: "New Hero", avatar: av(3) },
    message:
      "Cảm ơn bạn vì đã luôn giữ tinh thần tích cực và truyền năng lượng tốt cho cả team. Phong cách làm việc chuyên nghiệp và sự tỉ mỉ trong từng task của bạn thực sự đáng học hỏi.",
    hashtags: ["#Teamwork", "#Creative"],
    likes: 7,
    timestamp: "3 giờ trước",
  },
];

export const ALL_KUDOS: KudosItem[] = [
  {
    id: "ak-001",
    sender: { name: "Mai Phương Thúy", level: "CEVC9", badge: "Legend Hero", avatar: av(0) },
    receiver: { name: "Lê Kiều Trang", level: "CEVC6", badge: "Hero", avatar: av(1) },
    message:
      "Cảm ơn bạn đã hoàn thành feature mới nhanh và chính xác. Công việc của bạn giúp cả team tiến độ rất tốt trong sprint này. Tinh thần trách nhiệm của bạn thật đáng trân trọng!",
    hashtags: ["#Dedicated", "#Teamwork"],
    likes: 5,
    timestamp: "5 phút trước",
    images: ["/kudos/gallery-placeholder.png"],
  },
  {
    id: "ak-002",
    sender: { name: "Nguyễn Hoàng Linh", level: "CEVC8", badge: "New Hero", avatar: av(2) },
    receiver: { name: "Nguyễn Văn Quy", level: "CEVC5", badge: "Hero", avatar: av(3) },
    message:
      "Bạn đã xử lý bug production rất nhanh và hiệu quả. Nhờ đó chúng ta tránh được downtime kéo dài. Cảm ơn bạn vì sự phản ứng nhanh nhẹn và chuyên nghiệp!",
    hashtags: ["#Inspiring", "#Dedicated"],
    likes: 9,
    timestamp: "15 phút trước",
    images: ["/kudos/gallery-placeholder.png", "/kudos/gallery-placeholder.png"],
  },
  {
    id: "ak-003",
    sender: { name: "Nguyễn Bá Chức", level: "CEVC10", badge: "Legend Hero", avatar: av(4) },
    receiver: { name: "Dương Thúy An", level: "CEVC7", badge: "New Hero", avatar: av(5) },
    message:
      "Thiết kế UI/UX của bạn rất đẹp và user-friendly. Khách hàng phản hồi tích cực về trải nghiệm mới. Cảm ơn bạn vì sự sáng tạo và tư duy thiết kế xuất sắc!",
    hashtags: ["#Creative", "#Inspiring"],
    likes: 13,
    timestamp: "45 phút trước",
  },
  {
    id: "ak-004",
    sender: { name: "Đỗ Hoàng Hiệp", level: "CEVC8", badge: "Hero", avatar: av(0) },
    receiver: { name: "Mai Phương Thúy", level: "CEVC9", badge: "Legend Hero", avatar: av(1) },
    message:
      "Cảm ơn bạn đã review code rất kỹ và đưa ra nhiều gợi ý hữu ích. Nhờ đó code chất lượng hơn rất nhiều. Sự tỉ mỉ và hiểu biết sâu của bạn thực sự giúp ích cho cả team.",
    hashtags: ["#Mentor", "#Teamwork"],
    likes: 6,
    timestamp: "1 giờ trước",
    images: ["/kudos/gallery-placeholder.png"],
  },
  {
    id: "ak-005",
    sender: { name: "Lê Kiều Trang", level: "CEVC6", badge: "New Hero", avatar: av(2) },
    receiver: { name: "Nguyễn Bá Chức", level: "CEVC10", badge: "Legend Hero", avatar: av(3) },
    message:
      "Bạn đã dẫn dắt meeting kỹ thuật rất tốt. Mọi người đều hiểu rõ hướng giải quyết và có thể bắt tay vào làm ngay. Kỹ năng lãnh đạo của bạn thật đáng học hỏi!",
    hashtags: ["#Mentor", "#Inspiring"],
    likes: 18,
    timestamp: "2 giờ trước",
  },
  {
    id: "ak-006",
    sender: { name: "Nguyễn Văn Quy", level: "CEVC5", badge: "Hero", avatar: av(4) },
    receiver: { name: "Nguyễn Hoàng Linh", level: "CEVC8", badge: "New Hero", avatar: av(5) },
    message:
      "Cảm ơn bạn đã hỗ trợ mình debug issue khó hôm qua. Kiến thức về hệ thống của bạn thật sâu rộng. Mình rất biết ơn vì bạn đã dành thời gian giải thích tận tình cho mình.",
    hashtags: ["#Dedicated", "#Mentor"],
    likes: 11,
    timestamp: "3 giờ trước",
    images: ["/kudos/gallery-placeholder.png", "/kudos/gallery-placeholder.png", "/kudos/gallery-placeholder.png"],
  },
  {
    id: "ak-007",
    sender: { name: "Dương Thúy An", level: "CEVC7", badge: "Legend Hero", avatar: av(0) },
    receiver: { name: "Đỗ Hoàng Hiệp", level: "CEVC8", badge: "Hero", avatar: av(1) },
    message:
      "Bạn đã viết documentation rất chi tiết và dễ hiểu. Nhờ đó team mới onboard rất nhanh chóng. Cảm ơn bạn vì tinh thần chia sẻ kiến thức tuyệt vời!",
    hashtags: ["#Teamwork", "#Dedicated"],
    likes: 4,
    timestamp: "5 giờ trước",
  },
  {
    id: "ak-008",
    sender: { name: "Mai Phương Thúy", level: "CEVC9", badge: "New Hero", avatar: av(2) },
    receiver: { name: "Lê Kiều Trang", level: "CEVC6", badge: "Hero", avatar: av(3) },
    message:
      "Cảm ơn bạn đã luôn hỗ trợ QA process và tìm ra những bug quan trọng trước khi release. Sự tỉ mỉ của bạn giúp sản phẩm chất lượng hơn rất nhiều. Teamwork tuyệt vời!",
    hashtags: ["#Creative", "#Teamwork"],
    likes: 16,
    timestamp: "8 giờ trước",
    images: ["/kudos/gallery-placeholder.png"],
  },
];

export const RANKUP_LIST: LeaderboardItem[] = [
  { rank: 1, name: "Nguyễn Bá Chức", level: "CEVC10", avatar: av(0), note: "Lên hạng Huyền Thoại" },
  { rank: 2, name: "Đỗ Hoàng Hiệp", level: "CEVC8", avatar: av(1), note: "Lên hạng Anh Hùng Mới" },
  { rank: 3, name: "Dương Thúy An", level: "CEVC7", avatar: av(2), note: "Lên hạng Anh Hùng" },
  { rank: 4, name: "Mai Phương Thúy", level: "CEVC9", avatar: av(3), note: "Lên hạng Legend" },
  { rank: 5, name: "Lê Kiều Trang", level: "CEVC6", avatar: av(4), note: "Lên hạng Anh Hùng" },
];

export const GIFT_LIST: LeaderboardItem[] = [
  { rank: 1, name: "Nguyễn Hoàng Linh", level: "CEVC8", avatar: av(5), note: "Nhận Secret Box #42" },
  { rank: 2, name: "Nguyễn Văn Quy", level: "CEVC5", avatar: av(0), note: "Nhận Secret Box #41" },
  { rank: 3, name: "Mai Phương Thúy", level: "CEVC9", avatar: av(1), note: "Nhận Secret Box #40" },
  { rank: 4, name: "Nguyễn Bá Chức", level: "CEVC10", avatar: av(2), note: "Nhận Secret Box #39" },
  { rank: 5, name: "Đỗ Hoàng Hiệp", level: "CEVC8", avatar: av(3), note: "Nhận Secret Box #38" },
];

export const USER_STATS: UserStats = {
  received: 25,
  sent: 25,
  hearts: 25,
  secretBoxOpened: 25,
  secretBoxUnopened: 25,
};
