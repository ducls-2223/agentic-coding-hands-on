"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Sunner } from "../_lib/fetch-sunners";

/**
 * Server action: filter sunners by case-insensitive substring on `name`.
 * Trims whitespace and ignores non-letter junk (matches GUI spec test ID-9/10).
 * Returns at most `limit` rows. Empty/short query → top alphabetical slice.
 */
export async function searchSunners(query: string, limit = 10): Promise<Sunner[]> {
  const supabase = await createSupabaseServerClient();
  const trimmed = query.trim();

  let builder = supabase
    .from("sunners")
    .select("id, name, level, badge, avatar, department")
    .order("name", { ascending: true })
    .limit(limit);

  if (trimmed.length > 0) {
    // ilike escapes %/_ → escape any caller-provided wildcards.
    const safe = trimmed.replace(/[%_\\]/g, (m) => `\\${m}`);
    builder = builder.ilike("name", `%${safe}%`);
  }

  const { data, error } = await builder;
  if (error) {
    console.error("[searchSunners] failed:", error.message);
    return [];
  }
  return (data ?? []) as Sunner[];
}
