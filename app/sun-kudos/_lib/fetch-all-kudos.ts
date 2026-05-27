import type { Language } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { KudosItem } from "../_data/kudos-mock";
import { formatRelativeTime } from "./format-relative-time";

interface KudosRecipientRow {
  name: string;
  level: string;
  badge: string;
  avatar: string | null;
  department: string | null;
}

interface KudosHashtagRow {
  hashtag: string;
}

interface KudosRow {
  id: string;
  content: string;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
  author_level: string | null;
  author_badge: string | null;
  images: string[] | null;
  kudos_recipients: KudosRecipientRow | KudosRecipientRow[] | null;
  kudos_hashtags: KudosHashtagRow[] | null;
}

const FALLBACK_AVATAR = "/kudos/avatars/sender.png";

function firstRecipient(
  recipients: KudosRecipientRow | KudosRecipientRow[] | null,
): KudosRecipientRow | null {
  if (!recipients) return null;
  return Array.isArray(recipients) ? (recipients[0] ?? null) : recipients;
}

export async function fetchAllKudos(lang: Language): Promise<KudosItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("kudos")
    .select(
      "id, content, created_at, author_name, author_avatar, author_level, author_badge, images, kudos_recipients!inner(name, level, badge, avatar, department), kudos_hashtags(hashtag)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[fetchAllKudos] query failed:", error.code, error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as KudosRow[];

  return rows
    .map((row): KudosItem | null => {
      const recipient = firstRecipient(row.kudos_recipients);
      if (!recipient) return null;

      return {
        id: row.id,
        sender: {
          name: row.author_name ?? "Sunner",
          level: row.author_level ?? "",
          badge: row.author_badge ?? "",
          avatar: row.author_avatar ?? FALLBACK_AVATAR,
        },
        receiver: {
          name: recipient.name,
          level: recipient.level,
          badge: recipient.badge,
          avatar: recipient.avatar ?? FALLBACK_AVATAR,
          department: recipient.department ?? undefined,
        },
        message: row.content,
        hashtags: (row.kudos_hashtags ?? []).map((h) => h.hashtag),
        likes: 0,
        timestamp: formatRelativeTime(row.created_at, lang),
        images: row.images ?? undefined,
      };
    })
    .filter((item): item is KudosItem => item !== null);
}
