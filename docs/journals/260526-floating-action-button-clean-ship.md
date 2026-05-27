# Floating Action Button: Clean Ship

**Date**: 2026-05-26 11:47
**Severity**: Low
**Component**: UI/Layout
**Status**: Resolved

## What Happened

Implemented a persistent floating action button (FAB) at bottom-right of every authenticated page. Two states: collapsed pill (shows on scroll) + expanded column (3 buttons: "Viết KUDOS", "Thể lệ", close). Consulted MoMorph frames `_hphd32jN2` (collapsed) and `Sv7DFwBw1h` (expanded). Rules modal content scoped to static Vietnamese summary — no artwork, no gallery.

## The Brutal Truth

This shipped without teeth-grinding. No major refactoring surprises, no architectural thrashing, no "we need to redesign this" moments at review. The only friction was the reviewer catching a dead `<WidgetButton />` component still mounted on the homepage (visual overlap), which took 30 seconds to remove.

## Technical Details

**Architecture**: Single client component with 4-state machine (`collapsed | expanded | dialog | rules`). Reuses existing `KudosWriteDialog` + `createKudos` server action—no state lifting, no Context API, no global store.

**Mount pattern**: Made `app/layout.tsx` async, calls `getUser()` once at root, conditionally renders FAB only when user truthy. Naturally hides on `/login` + `/auth/callback`. All routes now dynamic-rendered implicitly.

**Build result**: Clean lint, no errors on first pass. Commit `5066dd1`.

## What We Tried

Nothing failed hard enough to warrant retries. Plan was clear, MoMorph specs were tight, user scoped rules modal down to a static summary (rejecting feature creep). Reviewer found the stale `<WidgetButton />` — removed it.

## Root Cause Analysis

No root cause. This was a high-confidence implementation off a locked-down spec. The decision to reuse `KudosWriteDialog` instead of lifting state or building a new dialog container was YAGNI-correct and cost us almost nothing in wiring.

## Lessons Learned

- **State-machine-per-component beats split components here.** Earlier instinct was to split collapsed/expanded/dialog into separate mounted components. The 4-state machine is readable, testable, and owns its own lifecycle. Resist over-abstraction on small stateful widgets.
- **Reusing existing dialogs (vs generic wrapper) is worth the specificity.** No Context plumbing, no double-fire risk, no indirection. Two-line wiring.
- **Double `getUser()` calls (root + individual pages) now implicit at root.** Not broken, but worth a future helper to dedup. Deferred to avoid scope creep.

## Next Steps

Accumulating doc gap: 9 patterns now undocumented. Current backlog includes async-root-layout-with-auth, force-dynamic-implicit, FAB-state-machine, click-outside-via-ref, KISS-reuse-dialog-no-lift. Recommend a doc-writer pass to capture these patterns in a shared "conventions" guide before the next person rebuilds them.

---

**Status:** DONE
**Summary:** Floating action button shipped clean—state machine pattern kept it simple, reused existing dialog, one stale component removed at review.
