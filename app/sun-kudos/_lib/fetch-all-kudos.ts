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
  likes_count: number | null;
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

export async function fetchAllKudos(
  lang: Language,
  userId?: string | null,
): Promise<KudosItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("kudos")
    .select(
      "id, content, created_at, author_name, author_avatar, author_level, author_badge, images, likes_count, kudos_recipients!inner(name, level, badge, avatar, department), kudos_hashtags(hashtag)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[fetchAllKudos] query failed:", error.code, error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as KudosRow[];
  const ids = rows.map((r) => r.id);

  // Mark which of the fetched kudos the current user has liked. Caller passes
  // userId so we don't duplicate the supabase.auth.getUser() round-trip that
  // page.tsx already makes. Unauthenticated viewers (userId null/undefined)
  // see every card as unliked.
  let likedSet: Set<string> = new Set();
  if (ids.length > 0 && userId) {
    const { data: likedRows, error: likedError } = await supabase
      .from("kudos_likes")
      .select("kudos_id")
      .eq("user_id", userId)
      .in("kudos_id", ids);
    if (likedError) {
      console.error("[fetchAllKudos] likes lookup failed:", likedError.message);
    } else {
      likedSet = new Set((likedRows ?? []).map((r) => r.kudos_id));
    }
  }

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
        likes: row.likes_count ?? 0,
        likedByMe: likedSet.has(row.id),
        timestamp: formatRelativeTime(row.created_at, lang),
        images: row.images ?? undefined,
      };
    })
    .filter((item): item is KudosItem => item !== null);
}
