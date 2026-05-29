# Clarifications — Write Kudos feature (Supabase-backed)

## MoMorph refs
- Viết Kudo: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2

## Session 2026-05-29

- Q: Recipient source for the autocomplete? → A: **New `sunners` table** queried via Supabase (real lookup with seed data).
- Q: Image upload — implement now or defer? → A: **Implement now** (Supabase Storage bucket + RLS + max 5 + type validation).
- Q: Rich-text formatting toolbar — visual-only, Markdown, or full editor? → A: **Full rich-text editor** (Tiptap / Lexical with B/I/S/list/link/quote).
- Q: @mention functionality — defer or implement? → A: **Implement** the cursor-aware @mention popover with autocomplete.
- Q: Which new DB schema additions? → A: All four — `kudos.honor_title` TEXT NULL, `kudos.is_anonymous` BOOLEAN, `kudos.anonymous_name` TEXT NULL, persistence to `kudos_hashtags` and `kudos_recipients`.
- Q: Testing scope? → A: **Skip tests for now**; ship persistence first, follow-up coverage later. Branch coverage will drop briefly below 90% — acknowledged trade-off.

## Notes
- The current `createKudos` action only persists `content` to the `kudos` table. All other fields captured in the dialog (`recipient`, `honorTitle`, `hashtags`, `anonymous`) are dropped on submit today. This effort closes that gap.
- The current `RecipientAutocomplete` uses a static `SUNNERS` array; this effort replaces it with a Supabase-backed lookup.
- The current rich-text toolbar is visual-only; this effort wires it to a real editor (Tiptap is the chosen library).
- Honor title (`Danh hiệu`) is visible in the design image but absent from the spec CSV — treat it as a recent design addition and persist it.
