# Next.js App Router Cache Strikes Twice

**Date**: 2026-05-27 14:02
**Severity**: Medium
**Component**: i18n / Language Switcher
**Status**: Resolved

## What Happened

Language switcher was broken. Clicking the language dropdown changed the URL (`?lang=en`), the LanguageProvider's reactive context flipped correctly, but 90% of the page text stayed Vietnamese. Manual reload fixed it.

## The Brutal Truth

This is the *second* cache-related i18n bug in two weeks. Both were architectural invisibility problems — nothing in the code screams "CAREFUL, NEXT.JS IS CACHING THIS." We spent 20 minutes tracing through the LanguageProvider, header reading, even considered Provider was stale (it wasn't). Once we realized the RSC payload was cached, the fix was literally one line: `router.refresh()`.

## Technical Details

**The bug:** `router.push(url)` with same pathname (only `?lang` changed) returns a cached RSC payload from the Router Cache. Server components like `t(lang, key)` execute once at render time with the old `x-lang` header → translations bake in Vietnamese → cached payload re-serves stale text.

**The fix (commit 492740f):**
```tsx
startTransition(() => {
  router.push(url);
  router.refresh(); // Invalidate Router Cache, force fresh server render
});
```

## Root Cause Analysis

Next.js Router Cache by default caches RSC payloads keyed on pathname alone, ignoring query params. Dynamic headers like `x-lang` that affect server component output aren't considered part of the cache key. This is a design assumption that breaks when a route uses headers to affect server-rendered *content* (not just metadata).

## Lessons Learned

1. **Query params + Server Components = Cache time bomb.** If your server component reads headers that change via query param, assume the Router Cache will betray you. Document this.

2. **`router.refresh()` is your escape hatch,** not a performance concern. Use it.

3. **Next.js invisibility strikes twice.** Two bugs, same family, both architectural (caching), both one-liners. This screams for an ADR (Architecture Decision Record) documenting "How i18n works with App Router caching."

## Next Steps

- Document i18n + App Router caching behavior in project docs
- Consider a `router.refresh()` utility wrapper for language-sensitive routes
- Review other header-dependent server components for the same pattern

**Status:** DONE
**Summary:** Language switcher's `router.push()` served cached RSC payload; added `router.refresh()` to force fresh server render with new `x-lang` header.
