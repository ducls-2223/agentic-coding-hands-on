# i18n Full Rollout + Language-Switch Persistence Bug Fix

**Date**: 2026-05-27 13:58  
**Severity**: Medium (rollout) + Low (persistence bug, user-reported)  
**Component**: i18n infrastructure, LanguageProvider, LocalizedLink  
**Status**: Resolved

## What Happened

Shipped full English translation across 42 files (838 insertions, 296 deletions). Rolled ~140 translation keys across dictionaries, converted 39 components to use `t()` / `useTranslation()` hook, and fixed a critical bug where switching languages didn't persist correctly across internal navigation.

Mid-build discovered: `highlight-section.tsx` (client) imported `kudos-card.tsx` which called `t(lang, key)` from `lib/i18n/server.ts` (marked `"server-only"`). This pulled the server-only module into the client bundle, causing build failure. Resolved by converting `kudos-card.tsx` to `"use client"` + `useTranslation()`.

Post-rollout, user reported: setting `?lang=en`, navigating to another page, clicking the language switcher to VI — the switcher still propagated `?lang=en` in the links. Bug persisted across all internal navigation.

## The Brutal Truth

The English translations are functional, not literary. Dictionary keys are decent but will need native-speaker review. The real frustration was the persistence bug: it looked like a typo in the switcher logic, but the diagnosis revealed a layer-of-abstraction issue that's dangerous if not documented. Next App Router caches root layouts across client-side navigations. The `<LanguageProvider value={getLanguage()}>` seeded once at build time. On intra-route nav, the layout never re-renders, so the Provider stale-holds the old language. Every `<LocalizedLink>` reads stale context. This pattern — caching defeating context reactivity — matters deeply and is **completely undocumented in the codebase.**

## Technical Details

**Build failure:**  
```
ERROR: server-only module imported into client bundle
File: app/sun-kudos/_components/highlight-section.tsx (client)
  → imports kudos-card.tsx
    → calls t(lang, key) from lib/i18n/server.ts
      → 'use server' marker prevents bundle
```

**Persistence bug root cause:**  
- `<LanguageProvider value={getLanguage()}>` in `app/layout.tsx` (server component)
- Root layout caches across intra-route navigation (Next.js default)
- Provider value never updates; `useSearchParams()` reads stale value
- `<LocalizedLink>` reads Provider, propagates stale `?lang=en` downstream

**Fix:**  
```typescript
// OLD: static prop from server
<LanguageProvider value={getLanguage()}>

// NEW: live read from URL on client
export function LanguageProvider({ initialLang, children }) {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') ?? initialLang;
  return <LangContext value={lang}>{children}</LangContext>;
}
```

## What We Tried

1. Assumed switcher component wasn't deleting `?lang=en` param — traced through `LocalizedLink` logic, verified param was correct.
2. Wondered if client-side navigation wasn't triggering the switcher — tested manually, switcher fired correctly.
3. Realized the Provider was holding the wrong value mid-nav — confirmed by logging `useTranslation()` return.

## Root Cause Analysis

Next.js layouts cache aggressively to avoid re-renders during intra-route navigation. A Context that depends on server-side data (like `getLanguage()`) becomes stale the moment the client-side URL changes. The Provider must read from a reactive source (URL search params) **on the client** to stay in sync with user intent. This is a collision between two App Router patterns: layout caching (good for perf) and Context reactivity (required for UX).

## Lessons Learned

1. **Context in cached layouts is a footgun.** If a root layout caches and your Provider reads static server data, the context will lag URL state. Always make Context read from reactive sources (`useSearchParams()`, not server props).

2. **Implementer delegation works, but boundary discipline costs.** I delegated 39 file conversions to save context. The implementer correctly used `t()` in client components but didn't catch the `kudos-card.tsx` → `server.ts` import chain. One round-trip fix. Net win, but I'd have caught it in 10 minutes myself. The trade-off was worth it.

3. **The diagnosis beat the code.** The switcher logic was fine. The localStorage sync was fine. The bug was architectural — a layer below. Understanding Next's caching model mattered more than reading source.

## Next Steps

- [ ] Document the "Context + layout caching" pattern in `docs/architecture.md` (currently missing entirely)
- [ ] Add comment to `LanguageProvider` explaining why it reads `useSearchParams()` (avoid future refactors breaking this)
- [ ] Consider native-speaker EN review for translation keys (flagged as "reasonable but not polished")
- [ ] Verify seed Kudos messages remain Vietnamese in prod (content-layer, by design)

