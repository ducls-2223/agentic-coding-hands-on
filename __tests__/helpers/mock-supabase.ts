import { vi } from "vitest";

export type FakeUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
} | null;

/**
 * Return a Supabase server-client mock object whose `auth.getUser()`
 * resolves with the given user (or null).
 */
export function makeSupabaseMock(user: FakeUser) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  };
}
