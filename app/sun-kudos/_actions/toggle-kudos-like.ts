"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ToggleKudosLikeResult {
  ok: boolean;
  /** New liked state for the current user after the toggle (true = liked). */
  liked?: boolean;
  /** Authoritative likes_count after the toggle, for client reconciliation. */
  count?: number;
  /** User-facing error message when ok=false. */
  error?: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Toggle the current user's like on a kudos. Inserts a `kudos_likes` row
 * if missing, deletes it if present. The Postgres trigger
 * `kudos_likes_sync_count_trg` keeps `kudos.likes_count` in sync, so the
 * authoritative count comes back via a single follow-up SELECT.
 */
export async function toggleKudosLike(
  kudosId: string,
): Promise<ToggleKudosLikeResult> {
  if (!UUID_RE.test(kudosId)) {
    return { ok: false, error: "Kudos không hợp lệ." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: getUserError } = await supabase.auth.getUser();
  if (getUserError) {
    console.error("[toggleKudosLike] getUser failed:", getUserError.message);
    return { ok: false, error: "Phiên đăng nhập có vấn đề. Vui lòng tải lại trang." };
  }
  const user = userData.user;
  if (!user) {
    return { ok: false, error: "Bạn cần đăng nhập để thích Kudos." };
  }

  // Check current state without throwing on miss.
  const { data: existing, error: selectError } = await supabase
    .from("kudos_likes")
    .select("kudos_id")
    .eq("kudos_id", kudosId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (selectError) {
    console.error("[toggleKudosLike] select failed:", selectError.message);
    return { ok: false, error: "Không thể đọc trạng thái thích." };
  }

  const wasLiked = existing !== null;
  if (wasLiked) {
    const { error: deleteError } = await supabase
      .from("kudos_likes")
      .delete()
      .eq("kudos_id", kudosId)
      .eq("user_id", user.id);
    if (deleteError) {
      console.error("[toggleKudosLike] delete failed:", deleteError.message);
      return { ok: false, error: "Không thể bỏ thích. Vui lòng thử lại." };
    }
  } else {
    const { error: insertError } = await supabase
      .from("kudos_likes")
      .insert({ kudos_id: kudosId, user_id: user.id });
    if (insertError) {
      // 23505 = unique_violation. Race window: another concurrent toggle
      // already wrote the row. The SELECT above said wasLiked=false, so the
      // user's intent was "like" — and the row now exists. We intentionally
      // skip the DELETE that would otherwise unlike it; reporting liked=true
      // matches the DB state and the user's intent.
      if (insertError.code !== "23505") {
        console.error("[toggleKudosLike] insert failed:", insertError.message);
        return { ok: false, error: "Không thể thích Kudos. Vui lòng thử lại." };
      }
    }
  }

  // Read the trigger-updated counter back as truth.
  const { data: kudosRow, error: countError } = await supabase
    .from("kudos")
    .select("likes_count")
    .eq("id", kudosId)
    .maybeSingle();
  if (countError || !kudosRow) {
    console.error("[toggleKudosLike] count read failed:", countError?.message);
    // The toggle succeeded; we just can't surface the count. Still ok.
    return { ok: true, liked: !wasLiked };
  }

  // No revalidatePath: /sun-kudos is `force-dynamic`, so there is no cached
  // version to bust. Calling revalidatePath here would be dead code today and
  // a footgun if the feed ever switches to static caching (every like toggle
  // would thrash the cache for every viewer).
  return { ok: true, liked: !wasLiked, count: kudosRow.likes_count };
}
