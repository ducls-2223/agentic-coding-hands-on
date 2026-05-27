// Single source of truth for the SAA event start time. Used by both the
// Next.js proxy (server) and the client-side countdown component, so it must
// stay free of "server-only" / "use client" markers.
const FALLBACK_ISO = "2025-12-31T18:30:00+07:00";

export function resolveEventStartMs(): number {
  const raw = process.env.NEXT_PUBLIC_EVENT_START_DATETIME ?? FALLBACK_ISO;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? new Date(FALLBACK_ISO).getTime()
    : parsed.getTime();
}
