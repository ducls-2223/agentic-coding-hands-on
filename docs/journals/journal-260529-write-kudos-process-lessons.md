# Write-Kudos Feature: Process & Lessons

**Date:** 2026-05-29  
**Severity:** Medium (process risk, not production)  
**Decision:** Ship 7 phases in one PR  
**Status:** Resolved with deferred test coverage gap

## What Happened

The user requested the entire Write-Kudos feature — schema, server action, Tiptap editor, image upload, mentions, RLS policies, storage bucket — as a single unified PR. I bundled phases 01–07 into one commit (`6e33f4c`). The reviewer caught two critical silent bugs before merge. Tests were skipped entirely. Ship succeeded, but with accumulated risk.

## The Brutal Truth

Seven phases in one review is overloaded. The cognitive load for the reviewer tripled, and only their diligence caught bugs that would have silently lost data in production. If the reviewer had missed those two gaps, every submit would lose all recipients and hashtags, and the next-day image feed would crash. That's not acceptable even for an MVP.

The user chose to skip tests again — this is the second time in this session. Twenty-three test cases are now marked `describe.skip` because Tiptap, browser APIs, and the new server contract broke their old assumptions. There's no follow-up task to rewrite them. That's a coverage pit.

## What We Tried

**Single-PR approach (chosen):**  
- Pro: One integration point, fewer merge conflicts.  
- Con: Massive review surface, harder to reason about interdependencies. The RLS bug and remotePatterns bug were both **invisible in unit tests** — they needed real DB constraints and real browser rendering to surface.

**Test approach (user chose skip):**  
- Would have caught the isLikelyHtml() edge case (old seed data renders as plaintext, new submissions as HTML) and some schema validation.  
- Would NOT have caught missing RLS INSERT policies or next/image config — both need integration tests or manual browser session.

## Root Cause Analysis

1. **Scope bundling**: Seven phases felt cohesive (they are — write flow is one feature) but violated the principle of reviewable changesets. The right cut would be:
   - PR1: Phases 01–04 (schema, server action, basic form) — 150 LOC, one reviewer focus.
   - PR2: Phases 05–07 (Tiptap, images, mentions) — 200 LOC, builds on PR1's RLS guarantees.

2. **Test skip accepted without escalation**: The user has now skipped tests twice. I should have flagged this in the first skip and suggested a follow-up task. Instead, I moved forward both times. Lesson: test skip is not a blocker, but it demands explicit risk acknowledgment and a hard follow-up deadline.

3. **Reviewer as safety net**: The reviewer became the only gate. That's acceptable in a small team, but only if we feed them complete context fast. I did this correctly (sent full patch early), but it's a fragile pattern that breaks if the reviewer is busy or distracted.

## Lessons Learned

1. **Use multiple PRs for features with 3+ distinct tracks (UI, backend, integration).** Write-Kudos had four: schema, server logic, editor component, storage. Each deserves its own review cycle.

2. **When the user skips tests, make them explicit about the follow-up.** A missed RLS policy or config detail will only surface in production or in a manual QA session. Create a task right then. Don't assume "we'll test it later."

3. **Tiptap + legacy content is a breaking change.** The feed now renders either raw HTML (new submissions) or plaintext (old seed rows). The `isLikelyHtml()` check saved the feature from looking broken retroactively, but that defensive code wouldn't exist if tests had caught the asymmetry. Next time: test the migration path explicitly.

4. **RLS policies are invisible to unit tests.** A policy that reads `kudos_id IN (SELECT ...)` only fails if you try to insert with a mismatched `kudos_id`. The test suite never does. Real DB constraints and real session playback are mandatory for RLS validation.

5. **Config values (remotePatterns, ALLOWED_TAGS) belong in tests.** The missing next/image remotePatterns would have been caught by a single browser render test. The Tiptap config would have been validated by an editor snapshot test. These aren't "nice-to-have" — they're load-bearing.

## Next Steps

- **Task: Rewrite skipped test suites (PR follow-up).** Owner: user or assigned reviewer. Deadline: before the next feature ships. This closes the 23-case gap.
- **Retrospective: Single vs. multi-PR decision.** Next feature with 4+ subsystems should default to multi-PR with explicit test coverage per PR.
- **Escalate test-skip policy.** If the user opts to skip again, I should ask: "Test suite rewrite deadline and who owns it?" before proceeding. Don't accept "we'll do it later" without a specific task.

---

**Status:** DONE  
**Summary:** Seven-phase feature shipped in one PR with reviewer-caught RLS and config bugs; skipped 23 tests with no follow-up task. Process lesson: larger features need smaller PRs, test skip demands explicit follow-up, and RLS validation is integration-test-only.

