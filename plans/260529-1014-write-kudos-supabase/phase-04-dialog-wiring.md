# Phase 04 — Dialog form-field wiring + validation

## Goal
Send every captured field into FormData, surface per-field validation errors inline, disable Submit until all required fields are populated.

## File
- Modify: `app/sun-kudos/_components/kudos-write-dialog.tsx`

## Changes
1. State already exists for: `content`, `recipient`, `honorTitle`, `hashtags`, `anonymous`. Replace `recipient: string` with `recipientId: string`. Add `anonymousName: string`.
2. Build the FormData manually inside the form's `action` prop using a wrapper:
   ```tsx
   <form action={async (fd) => {
     fd.set("recipient_id", recipientId);
     fd.set("honor_title", honorTitle);
     fd.set("is_anonymous", String(anonymous));
     if (anonymous) fd.set("anonymous_name", anonymousName);
     fd.set("hashtags", JSON.stringify(hashtags));
     fd.set("images", JSON.stringify(uploadedImageUrls));
     // content + name="content" textarea is already in fd
     return formAction(fd);
   }}>
   ```
3. Render anonymous-name input when `anonymous === true` (per test case ID-43).
4. Per-field error display: when `state?.error` mentions a field, attach a red ring + helper text to that input.
5. Submit disabled when any required is missing (recipient, content trimmed, ≥1 hashtag, anonymous-name if anonymous).

## Acceptance
- Submitting without recipient ⇒ inline error on the recipient input, no DB write.
- Submitting without content ⇒ inline error on the textarea.
- Submitting with zero hashtags ⇒ inline error on the hashtag section.
- Submit with all fields ⇒ row inserted, dialog closes, toast shows.

## Result
**Status:** Completed. KudosWriteDialog wired to collect all FormData fields (recipient_id, honor_title, is_anonymous, anonymous_name, hashtags, images). Per-field validation errors displayed inline via UpdateFormStateResult. Submit button disabled when required fields missing. Anonymous name input rendered conditionally. All state managed via React hooks matching component structure.
