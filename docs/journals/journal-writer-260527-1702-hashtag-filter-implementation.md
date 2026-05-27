# Hashtag Filter Multi-Select Implementation — ARIA Bug Inherited from DepartmentFilter

**Date**: 2026-05-27 17:02
**Severity**: Medium
**Component**: HighlightSection, DepartmentFilter (pattern inheritance)
**Status**: Resolved (with follow-up debt)

## What Happened

Completed multi-select hashtag filter for HighlightSection per Figma spec `p9zO-c4a4x`. Reused DepartmentFilter scaffold (trigger button + dropdown + click-outside hook). Implemented 13-entry `AVAILABLE_HASHTAGS` constant (5 mock + 8 from Figma), multi-select logic capped at 5 items, OR semantics within hashtags, AND with existing department filter.

Reviewer flagged critical ARIA violation: `<button>` element nested inside `<li role="option">` — invalid DOM structure. Fixed by flattening to interactive `<li>` with onClick + keydown handler + proper `aria-disabled` state.

## The Brutal Truth

The frustrating part is we copy-pasted the DepartmentFilter pattern without catching the nested button bug. It shipped 2 hours ago with the same violation. Now we're fixing it twice — once here, once there. This is a debt tracker moment.

## Technical Details

**The bug:** 
```jsx
// BEFORE (invalid)
<li role="option">
  <button onClick={...}>Select</button>
</li>

// AFTER (valid)
<li role="option" onClick={...} onKeyDown={handleKeyDown}>
  <span aria-disabled={isDisabled}>Select</span>
</li>
```

DepartmentFilter shipped with identical structure. High-priority follow-up needed.

## Root Cause Analysis

Pattern reuse compressed development but skipped ARIA review. The scaffold was tactically correct (trigger, dropdown, semantics) but structurally broken. Copy-paste velocity beat accessibility scrutiny.

## Lessons Learned

- **Pattern audits before reuse:** Screen a scaffold's a11y before scaling it to other filters
- **Nested interactive elements are a landmine:** Button inside option always fails validation — establish this as a code review gate
- **Track inherited debt:** When fixing a bug found in a reused pattern, immediately audit where else it was used

## Next Steps

1. **High priority:** Apply same ARIA fix to DepartmentFilter (file tracking needed, not in scope here)
2. **Prevent recurrence:** Add accessibility linter rule blocking interactive nesting
3. **Document the pattern:** Create a FilterTrigger component with correct ARIA structure for future reuse

---

**Status:** DONE
**Summary:** Multi-select hashtag filter working; ARIA violation fixed, but inherited bug from DepartmentFilter needs follow-up.
