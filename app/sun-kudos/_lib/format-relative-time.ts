import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n/t";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(
  createdAt: string | Date,
  lang: Language,
  now: Date = new Date(),
): string {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const diff = Math.max(0, now.getTime() - created.getTime());

  if (diff < MINUTE) return t(lang, "time.just_now");
  if (diff < HOUR) return t(lang, "time.minutes_ago", { n: Math.floor(diff / MINUTE) });
  if (diff < DAY) return t(lang, "time.hours_ago", { n: Math.floor(diff / HOUR) });
  return t(lang, "time.days_ago", { n: Math.floor(diff / DAY) });
}
