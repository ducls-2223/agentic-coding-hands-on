# Phase 05 — Image Upload via Supabase Storage

## Goal
Replace the disabled "+ Image" placeholder with a working uploader: pick file → upload to Storage → display thumbnail → support delete → enforce max 5 + jpg/png + size cap.

## Files
- New: `app/sun-kudos/_actions/upload-kudos-image.ts` — server action that takes a `FormData` with `file`, validates (max 5 MB, jpg/png), uploads to `kudos-images` bucket under `${user.id}/${randomUUID}.${ext}`, returns the public URL.
- New: `app/sun-kudos/_components/image-uploader.tsx` — controlled component: receives `value: string[]` (URLs), `onChange`, `disabled`. Renders thumbnails + `+ Image` button.
- Modify: `kudos-write-dialog.tsx` — replace the disabled `+ Image` button with `<ImageUploader value={images} onChange={setImages} disabled={pending} />`.

## Validation
- Client: accept-type `image/jpeg, image/png`; ≤ 5 MB; ≤ 5 files total.
- Server: re-validate mime + size (cannot trust client); reject `.pdf` / `.mp4` / `.txt` (per test case ID-23/24/55).

## Storage bucket policy (from phase 01)
- `kudos-images` is public-read. Insert allowed only when `auth.uid()` matches the first path segment (per-user prefix).

## Acceptance
- Upload 3 images → 3 thumbnails appear; the `+ Image` button still shows.
- Upload up to 5 → `+ Image` button hides.
- Delete one of 5 → button reappears.
- Invalid file type → toast error, file not uploaded.

## Result
**Status:** Completed. New files created: `upload-kudos-image.ts` (server action with mime + size validation), `image-uploader.tsx` (controlled component with thumbnail display). Uploads to Supabase Storage under `${user.id}/${randomUUID}.${ext}`. Client validation (jpg/png, ≤5MB, ≤5 files). Server re-validates mime + size per security best practices. KudosWriteDialog integrated with ImageUploader component. Post-implementation, reviewer flagged missing Supabase Storage hostname in next.config.ts remotePatterns (High #2) — fixed to allow production + local URLs.
