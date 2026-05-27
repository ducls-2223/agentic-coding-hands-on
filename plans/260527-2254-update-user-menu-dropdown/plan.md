# Plan — Update User Menu Dropdown to MoMorph Design

## MoMorph refs
- Dropdown-profile: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/z4sCl3_Qtk
- Clarifications: ./clarifications.md

## Scope
Restyle the open dropdown panel of [app/_components/user-menu.tsx](../../app/_components/user-menu.tsx) to match the MoMorph "Dropdown-profile" frame. Trigger button untouched. No backend changes.

## Phases
- [x] phase-01 — Replace dropdown panel markup + styles (single phase, single file)

## Key Decisions (from clarifications.md)
1. Drop the signed-in name/email row from the panel.
2. Profile glow is hover/focus only, not persistent.
3. Trigger button preserved as-is.

## Out of Scope
- Trigger button restyle
- Sign-out flow or routing
- Avatar trigger logic
- New translations (`nav.profile`, `nav.sign_out` already exist)

## Success Criteria
- Open panel visually matches MoMorph frame z4sCl3_Qtk (dark rounded card, Profile w/ user icon + hover glow, Logout w/ chevron-right).
- Profile link still routes to `/profile`; Logout still calls `signOutAction`.
- `npm run build` + `npm run lint` clean.
- Click-outside-to-close still works; menu still closes after navigation.
