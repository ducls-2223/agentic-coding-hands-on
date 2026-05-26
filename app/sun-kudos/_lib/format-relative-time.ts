const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(createdAt: string | Date, now: Date = new Date()): string {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const diff = Math.max(0, now.getTime() - created.getTime());

  if (diff < MINUTE) return "Vừa xong";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} phút trước`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} giờ trước`;
  return `${Math.floor(diff / DAY)} ngày trước`;
}
