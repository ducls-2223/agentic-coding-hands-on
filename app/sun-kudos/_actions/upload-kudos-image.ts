"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface UploadKudosImageResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png"]);
const ALLOWED_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
};

/**
 * Upload a single kudos attachment to the `kudos-images` Storage bucket.
 * Path: `${auth.uid()}/${randomUUID}.${ext}` — matches the RLS policy that
 * permits inserts only when the first folder of the object path equals the
 * caller's user id.
 *
 * Validates mime type + size server-side; the client UI does the same checks
 * for fast feedback but never trust the browser.
 */
export async function uploadKudosImage(
  formData: FormData,
): Promise<UploadKudosImageResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "File không hợp lệ." };
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: "Chỉ chấp nhận ảnh JPG hoặc PNG." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Ảnh vượt quá 5MB." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: getUserError } = await supabase.auth.getUser();
  if (getUserError || !userData.user) {
    return { ok: false, error: "Bạn cần đăng nhập để tải ảnh." };
  }

  const ext = ALLOWED_EXT[file.type];
  const path = `${userData.user.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("kudos-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("[uploadKudosImage] upload failed:", uploadError.message);
    return { ok: false, error: "Không thể tải ảnh. Vui lòng thử lại." };
  }

  const { data: publicUrl } = supabase.storage
    .from("kudos-images")
    .getPublicUrl(path);
  return { ok: true, url: publicUrl.publicUrl };
}
