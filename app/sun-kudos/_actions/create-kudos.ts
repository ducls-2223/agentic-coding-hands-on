"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CreateKudosResult {
  ok: boolean;
  error?: string;
}

const MAX_CONTENT_LENGTH = 5000;

/**
 * Server action: persist a new kudos to Supabase.
 *
 * Called from the Write Kudos dialog. Returns a result object so the client
 * can render a toast or surface a validation error inline. On success, the
 * kudos feed at /sun-kudos is revalidated so any DB-backed list re-fetches.
 */
export async function createKudos(
  _prevState: CreateKudosResult | null,
  formData: FormData,
): Promise<CreateKudosResult> {
  const rawContent = formData.get("content");
  if (typeof rawContent !== "string") {
    return { ok: false, error: "Nội dung không hợp lệ." };
  }
  const content = rawContent.trim();
  if (content.length === 0) {
    return { ok: false, error: "Vui lòng nhập nội dung lời cảm ơn." };
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return {
      ok: false,
      error: `Nội dung quá dài (tối đa ${MAX_CONTENT_LENGTH} ký tự).`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: getUserError } = await supabase.auth.getUser();
  if (getUserError) {
    console.error("[createKudos] getUser failed:", getUserError.message);
    return { ok: false, error: "Phiên đăng nhập có vấn đề. Vui lòng tải lại trang." };
  }
  const user = userData.user;
  if (!user) {
    return { ok: false, error: "Bạn cần đăng nhập để gửi Kudos." };
  }

  const { error } = await supabase
    .from("kudos")
    .insert({ author_id: user.id, content });

  if (error) {
    console.error("[createKudos] insert failed:", error.code, error.message);
    return { ok: false, error: "Không thể lưu Kudos. Vui lòng thử lại." };
  }

  // Page is `force-dynamic`, so this is a no-op today — kept as a safety
  // net for when the feed switches from mock data to a Supabase query and
  // any wrapping layout introduces caching.
  revalidatePath("/sun-kudos");
  return { ok: true };
}
