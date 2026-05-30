# Coverage Push Process & Escalation Patterns

**Date:** 2026-05-29 15:00–18:30
**Severity:** Medium (meta-lesson, not a bug)
**Component:** Testing strategy, test coverage goals
**Status:** Resolved with option-recommendation

## What Happened

Three sequential coverage passes in one session, each targeting a higher bar:
1. **Pass 1 (74.8% stmts):** Cherry-pick vitest infra from feat/unit_test; land 230 tests on feat/write-kudos
2. **Pass 2 (90.4% stmts, 82.5% branches):** Add 0%-covered file suites (actions, utility functions, new components)
3. **Pass 3 (94.08% stmts, 86.09% branches):** Target branches explicitly; stalled at 86%, user accepts recommendation to ship as-is

## The Ratchet Trap

After each pass cleared a target, the next ask was "now hit 90% [of the next metric]." This is a normal product instinct—higher is better—but it exposed a structural ceiling: **unit tests alone cannot close the jsdom-hostile branches.**

When branch coverage stuck at 86%, the honest move was to present three options with analysis:
1. Ship at 86% branches (unit-test ceiling; Playwright can close gap if needed)
2. Merge Playwright E2E suite into this branch (real browser; covers the same code + more)
3. Invest in Vitest browser mode (solves jsdom limits but carries setup/CI cost)

User chose option 1. The lesson: **frame trade-offs, not just "keep going."**

## The Broken Pattern: doMock + resetModules

Attempted twice to auto-fill `kudos-write-dialog` form state using `vi.doMock` + `vi.resetModules` in the test setup. The goal: force the child components to mount with the mocked state already in scope.

**Why it failed both times:**
- ESM module caching under Vitest keeps the first mock registration even after `resetModules()`
- React 19 form actions don't compose cleanly with jsdom refs; `useImperativeHandle` reads fail in isolation
- Tiptap's `EditorContent` ref is not a standard `HTMLElement`; forwarding it through a jsdom context breaks the contract

**Better path:** mock `vi.mock('./tiptap')` at the top level, mock form actions directly, and accept that full submit-flow coverage requires Playwright.

## Coverage ROI Reality

The gap between 82.5% and 90% branches required:
- 4 hours of test-shape edits (adding edge cases, error paths, null guards)
- Identified that 60% of uncovered branches are jsdom-hostile (Tiptap refs, FileReader errors, prosemirror events)
- The remaining 40% are defensive null-coalescing that adds test fragility without meaningful protection

**Lesson:** after 85% branch coverage, unit-test ROI inverts. Every 1% requires exponential effort against diminishing-return branches. Stop and use E2E tests instead.

## What Stayed Solid

- Build/lint never broke (safety net held)
- The `describe.skip` on `user-menu.test.tsx` Escape-key test is still deferred (that redesign is on feat/unit_test; resolves at merge)
- All 309 tests pass; 1 intentional skip
- No false positives; no mocks hiding real bugs

## Next Time

1. **Set branch-coverage ceiling expectations upfront.** Don't aim for 90% branches on jsdom; unit tests max out at ~85%.
2. **Use Playwright for Tiptap coverage.** It already exists in this repo (feat/unit_test E2E suite). Merging or porting it is faster than jsdom stubs.
3. **When asked to "improve to X%," present options.** Makes the trade-off visible and keeps the session goal-driven instead of open-ended.
4. **Document jsdom hostility explicitly** in the code (e.g., `// jsdom limitation: FileReader.onerror unreliable; see Playwright suite`). Future devs won't re-attempt the impossible.

## Final State

- **Branch:** feat/write-kudos @ commit 9af2d3d
- **Coverage:** 94.08% stmts, 86.09% branches (acceptable; not a blocker)
- **Tests:** 309 passing, 1 skipped, 0 failed
- **Next:** can ship test suite as-is; Playwright E2E remains the source of truth for interactive form flows
