# User Menu Dropdown Restyle to MoMorph Design

**Date**: 2026-05-27 23:27
**Severity**: Medium
**Component**: app/_components/user-menu.tsx
**Status**: Resolved

## What Happened

Implemented MoMorph design spec for user-menu dropdown (frame z4sCl3_Qtk: "Dropdown-profile"). Dark rounded panel with two items—Profile and Logout—each with icon and label. No test cases provided, so three design gaps were clarified with the user before implementation began.

Single-file change: app/_components/user-menu.tsx. Lint and build passed. Visual validation injected the rendered component into the /login page DOM since Google authentication isn't available in the sandbox.

Reviewer identified 4 a11y/CSS gaps in review; all fixed in the same commit:
- Missing Escape key handler (now closes dropdown)
- Missing focus-visible rings on interactive elements
- Trigger button missing aria-expanded + aria-haspopup
- Overly broad transition rule (changed transition-all to transition-colors)

## The Brutal Truth

The no-test-cases situation was annoying—typical "design handed over, implementation expected to telepathically infer behavior." Three clarifications up front saved a rewrite: header row isn't a persistent state, hover glow is transient, trigger button logic is unchanged. Visual validation without actual login access felt like a hack, but proved sufficient to catch the glow/color regressions before commit.

The a11y review caught regressions that wouldn't have surfaced in visual testing alone. That shouldn't surprise us anymore, and yet.

## Technical Details

**Clarifications made:**
1. Drop the displayName/email header row from the original design
2. Profile item's warm-tint glow appears only on hover/focus, not persistent
3. Trigger button styling and behavior unchanged

**Asset choice:** MoMorph spec had no chevron-right icon. public/home/ only had a diagonal arrow. Rather than creating a new asset file, used an inline SVG with currentColor—keeps the icon recolorable and avoids bloating the public/ directory.

**Validation workaround:** Injected the dropdown markup into /login page DOM and visually tested against the MoMorph frame. Not ideal, but caught glow color mismatch and spacing drift.

**A11y wins:**
- Escape key now closes the dropdown
- Focus rings visible on both trigger and menu items
- Trigger properly announces dropdown state + menu role to screen readers
- CSS transitions respect the visual change scope (colors, not layout)

## Why This Matters

Clarifying before building prevented scope creep and rework. The inline SVG decision kept the codebase cleaner than adding a new icon file. A11y fixes landed alongside visual work—no separate accessibility sprint needed. Visual validation in a sandbox has limits, but injecting into a page DOM made sense given the constraints.

## Next Steps

None—shipped clean. Future dropdown/menu work should request test cases as part of design handoff and plan a11y review into the initial implementation window.
