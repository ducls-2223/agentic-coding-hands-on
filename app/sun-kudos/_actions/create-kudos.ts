"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { sanitizeKudosHtml, stripKudosHtml } from "@/lib/sanitize-kudos-html";

export interface CreateKudosResult {
  ok: boolean;
  /** Top-level error message — display as a banner. */
  error?: string;
  /** Per-field validation errors keyed by FormData name. */
  fieldErrors?: Partial<Record<KudosField, string>>;
}

type KudosField =
  | "content"
  | "recipient_id"
  | "honor_title"
  | "is_anonymous"
  | "anonymous_name"
  | "hashtags"
  | "images";

const MAX_CONTENT_LENGTH = 5000;
const MAX_HONOR_TITLE = 200;
const MAX_ANONYMOUS_NAME = 80;
const MIN_HASHTAGS = 1;
const MAX_HASHTAGS = 5;
const MAX_IMAGES = 5;
const HASHTAG_MAX_CHARS = 30;

function parseJsonArray(raw: FormDataEntryValue | null): string[] | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return null;
  }
}

function normalizeHashtag(raw: string): string | null {
  const trimmed = raw.trim().replace(/^#+/, "");
  if (!trimmed) return null;
  if (trimmed.length > HASHTAG_MAX_CHARS) return null;
  return `#${trimmed}`;
}

export async function createKudos(
  _prevState: CreateKudosResult | null,
  formData: FormData,
): Promise<CreateKudosResult> {
  const fieldErrors: NonNullable<CreateKudosResult["fieldErrors"]> = {};

  // 1. Content (HTML from Tiptap).
  const rawContent = formData.get("content");
  if (typeof rawContent !== "string") {
    return { ok: false, error: "Nội dung không hợp lệ." };
  }
  const sanitized = sanitizeKudosHtml(rawContent);
  const plain = stripKudosHtml(sanitized);
  if (plain.length === 0) {
    fieldErrors.content = "Không được để trống.";
  } else if (sanitized.length > MAX_CONTENT_LENGTH) {
    // Sanitized HTML length matches the DB CHECK on kudos.content. Plain-text
    // length would let formatted submissions slip past validation and fail
    // at insert with an opaque error.
    fieldErrors.content = `Nội dung quá dài (tối đa ${MAX_CONTENT_LENGTH} ký tự).`;
  }

  // 2. Recipient (sunner uuid).
  const recipientId = formData.get("recipient_id");
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof recipientId !== "string" || recipientId.length === 0) {
    fieldErrors.recipient_id = "Vui lòng chọn người nhận.";
  } else if (!UUID_RE.test(recipientId)) {
    // Validate shape locally so a malformed id surfaces as a clean field
    // error rather than a Postgres "invalid input syntax for type uuid".
    fieldErrors.recipient_id = "Người nhận không hợp lệ.";
  }

  // 3. Honor title (optional, capped).
  const rawHonor = formData.get("honor_title");
  const honorTitle =
    typeof rawHonor === "string" ? rawHonor.trim().slice(0, MAX_HONOR_TITLE) : "";

  // 4. Anonymous flag + name.
  const isAnonymous = formData.get("is_anonymous") === "true";
  const rawAnonymousName = formData.get("anonymous_name");
  const anonymousName =
    typeof rawAnonymousName === "string"
      ? rawAnonymousName.trim().slice(0, MAX_ANONYMOUS_NAME)
      : "";
  if (isAnonymous && anonymousName.length === 0) {
    fieldErrors.anonymous_name = "Vui lòng nhập tên ẩn danh.";
  }

  // 5. Hashtags — JSON-encoded array of tag strings.
  const rawHashtags = parseJsonArray(formData.get("hashtags"));
  const hashtags: string[] = [];
  if (rawHashtags === null || rawHashtags.length < MIN_HASHTAGS) {
    fieldErrors.hashtags = "Không được để trống.";
  } else if (rawHashtags.length > MAX_HASHTAGS) {
    fieldErrors.hashtags = `Tối đa ${MAX_HASHTAGS} hashtag.`;
  } else {
    const seen = new Set<string>();
    for (const raw of rawHashtags) {
      const tag = normalizeHashtag(raw);
      if (!tag) {
        fieldErrors.hashtags = "Hashtag không hợp lệ.";
        break;
      }
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      hashtags.push(tag);
    }
    if (!fieldErrors.hashtags && hashtags.length === 0) {
      fieldErrors.hashtags = "Không được để trống.";
    }
  }

  // 6. Images — JSON-encoded array of public storage URLs.
  const rawImages = parseJsonArray(formData.get("images"));
  let images: string[] = [];
  if (rawImages !== null) {
    if (rawImages.length > MAX_IMAGES) {
      fieldErrors.images = `Tối đa ${MAX_IMAGES} ảnh.`;
    } else {
      // Use getSupabaseEnv so a missing env throws loudly instead of
      // producing an empty prefix (which would accept any relative URL).
      const { url: supabaseUrl } = getSupabaseEnv();
      const publicPrefix = `${supabaseUrl}/storage/v1/object/public/kudos-images/`;
      const filtered = rawImages.filter((url) => url.startsWith(publicPrefix));
      if (filtered.length !== rawImages.length) {
        fieldErrors.images = "URL ảnh không hợp lệ.";
      } else {
        images = filtered;
      }
    }
  }

  // 7. Bail early if any field-level errors.
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Vui lòng kiểm tra lại biểu mẫu.", fieldErrors };
  }

  const supabase = await createSupabaseServerClient();

  // 8. Auth — must be signed in.
  const { data: userData, error: getUserError } = await supabase.auth.getUser();
  if (getUserError) {
    console.error("[createKudos] getUser failed:", getUserError.message);
    return { ok: false, error: "Phiên đăng nhập có vấn đề. Vui lòng tải lại trang." };
  }
  const user = userData.user;
  if (!user) {
    return { ok: false, error: "Bạn cần đăng nhập để gửi Kudos." };
  }

  // 9. Look up the recipient row to denormalize into kudos_recipients.
  const { data: sunner, error: sunnerError } = await supabase
    .from("sunners")
    .select("id, name, level, badge, avatar, department")
    .eq("id", recipientId as string)
    .maybeSingle();
  if (sunnerError) {
    console.error("[createKudos] sunner lookup failed:", sunnerError.message);
    return { ok: false, error: "Không thể xác nhận người nhận. Vui lòng thử lại." };
  }
  if (!sunner) {
    return {
      ok: false,
      fieldErrors: { recipient_id: "Người nhận không tồn tại." },
    };
  }

  // 10. Derive sender display fields from the auth user's metadata.
  const senderName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Sunner";
  const senderAvatar =
    (user.user_metadata?.avatar_url as string | undefined) ?? "/kudos/avatars/sender.png";

  // 11. Insert the kudos row.
  const { data: kudosRow, error: insertKudosError } = await supabase
    .from("kudos")
    .insert({
      author_id: user.id,
      content: sanitized,
      honor_title: honorTitle || null,
      is_anonymous: isAnonymous,
      anonymous_name: isAnonymous ? anonymousName : null,
      author_name: senderName,
      author_avatar: senderAvatar,
      author_level: "Hero",
      author_badge: "New Hero",
      images: images.length > 0 ? images : null,
    })
    .select("id")
    .single();
  if (insertKudosError || !kudosRow) {
    console.error("[createKudos] kudos insert failed:", insertKudosError?.message);
    return { ok: false, error: "Không thể lưu Kudos. Vui lòng thử lại." };
  }

  // 12. Insert the recipient row (denormalized).
  const { error: recipientError } = await supabase.from("kudos_recipients").insert({
    kudos_id: kudosRow.id,
    sunner_id: sunner.id,
    name: sunner.name,
    level: sunner.level,
    badge: sunner.badge,
    avatar: sunner.avatar,
    department: sunner.department,
  });
  if (recipientError) {
    console.error("[createKudos] recipient insert failed:", recipientError.message);
    // Continue — kudos row is in place, recipient missing is fixable upstream.
  }

  // 13. Bulk insert hashtags.
  if (hashtags.length > 0) {
    const { error: hashtagError } = await supabase
      .from("kudos_hashtags")
      .insert(hashtags.map((h) => ({ kudos_id: kudosRow.id, hashtag: h })));
    if (hashtagError) {
      console.error("[createKudos] hashtag insert failed:", hashtagError.message);
    }
  }

  revalidatePath("/sun-kudos");
  return { ok: true };
}
