## Code Review Summary — user-menu.tsx dropdown restyle

### Scope
- File: `app/_components/user-menu.tsx` (103 lines total, panel block ~42 lines changed)
- Branch: `feature/dropdown_profile`
- Focus: open-panel block only (trigger button unchanged per clarification)

---

### Overall Assessment

Clean, minimal change. Logic is intact, translations verified, build passes. Four issues worth fixing before merge (two warnings, two nits).

---

### Critical Issues

None.

---

### High Priority

**1. `focus-visible:outline-none` with no replacement focus ring — a11y regression (warning)**

Both the Profile link (line 63) and the Sign-out button (line 78) suppress the browser's default focus outline via `focus-visible:outline-none` without substituting any visible indicator. On a dark background the warm-tint bg on Profile (`#FFEA9E/15`) is low-contrast and may not satisfy WCAG 2.1 SC 2.4.7 (visible focus). The logout row has no color change at all on focus-visible (only `bg-white/10`), making keyboard focus effectively invisible.

Fix: add a minimal ring, e.g., `focus-visible:ring-1 focus-visible:ring-[#FFEA9E]/60` on Profile and `focus-visible:ring-1 focus-visible:ring-white/40` on Logout. This also avoids needing `outline-none`.

**2. No Escape-key handler — keyboard trap (warning)**

The dropdown opens on click but can only be closed by: clicking outside, clicking Profile, or submitting the form. Pressing `Escape` while focus is inside the panel does nothing. This is a standard keyboard interaction (WAI-ARIA menu pattern). Screen-reader and keyboard-only users get stuck.

Fix: add a `keydown` listener for `Escape` inside the `useEffect` (or as `onKeyDown` on the container div) that calls `setOpen(false)`.

---

### Medium Priority

**3. Missing `aria-expanded` on trigger button (warning)**

The trigger `<button>` has `aria-label` but no `aria-expanded={open}` or `aria-haspopup`. Without `aria-expanded`, screen readers cannot announce whether the menu is open or closed. This is a pre-existing gap but the restyle is a good opportunity to fix it.

Fix:
```tsx
<button
  onClick={() => setOpen((v) => !v)}
  aria-label={t("nav.profile")}
  aria-expanded={open}
  aria-haspopup="menu"
  ...
>
```

**4. `displayName` derived but only used as `alt` text for avatar image (suggestion)**

`displayName` (line 19-20) is still computed. Now that the header row is removed, its only consumer is `alt={displayName}` on the avatar `<Image>` (line 43). The value is still correct there — no dead code, just slightly over-engineered. No action required, but a comment noting the remaining usage would prevent the next developer from assuming it is orphaned.

---

### Low Priority

**5. `transition-all` on Profile link vs `transition-colors` on Logout (nit)**

Profile uses `transition-all` (animates every CSS property) while Logout uses the narrower `transition-colors`. Both only visually change background/shadow on hover, so `transition-all` is broader than necessary. Not a bug but inconsistent.

Fix: change Profile to `transition-colors` for consistency and slightly better paint performance.

---

### Edge Cases Found

- `mousedown` click-outside listener is correct (captures before blur); no regression there.
- `signOutAction` is invoked as a form action; if the server action throws, the error propagates silently to the user (no toast/error state). Pre-existing issue, not introduced by this change.
- `w-38` is valid in Tailwind v4 (9.5rem). Confirmed.
- Both `nav.profile` and `nav.sign_out` keys exist in English and Vietnamese dictionaries.
- `remotePatterns` for `lh3.googleusercontent.com` is configured in `next.config.ts`. Avatar image regression risk: none.

---

### Positive Observations

- `aria-hidden` on both decorative images (icon-user and chevron SVG) — correct.
- Click-outside via `useRef` + `mousedown` is solid.
- Form-action binding for sign-out is idiomatic Next.js App Router.
- Warm-tint glow shadow (`rgba(255,234,158,0.35)`) matches the MoMorph idle→hover spec exactly.
- No PII or internal data exposed in the panel after header row removal.

---

### Recommended Actions

1. **(High)** Add `focus-visible:ring-*` to both items; remove bare `outline-none` from focus-visible states.
2. **(High)** Add `Escape` key handler to close the dropdown.
3. **(Medium)** Add `aria-expanded={open}` + `aria-haspopup="menu"` to the trigger button.
4. **(Low)** Change Profile link `transition-all` → `transition-colors`.

---

### Verdict

**Approve with tweaks.** Issues 1 and 2 are a11y regressions that should be fixed before merge (30-min fix total). Issue 3 is a pre-existing gap but easy to close in the same commit. Issue 4 is cosmetic.
