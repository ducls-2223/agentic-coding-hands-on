import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface Sunner {
  id: string;
  name: string;
  level: string;
  badge: string;
  avatar: string | null;
  department: string | null;
}

/**
 * Fetch the full Sunner directory (top 100 alphabetical). Used as the initial
 * payload for the recipient autocomplete + the @mention popover so the first
 * keystroke has results immediately, before the debounced search action fires.
 */
export async function fetchSunners(limit = 100): Promise<Sunner[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sunners")
    .select("id, name, level, badge, avatar, department")
    .order("name", { ascending: true })
    .limit(limit);
  if (error) {
    console.error("[fetchSunners] failed:", error.message);
    return [];
  }
  return (data ?? []) as Sunner[];
}
