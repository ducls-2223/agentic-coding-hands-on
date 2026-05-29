import DOMPurify from "isomorphic-dompurify";

/**
 * Strict allow-list for kudos rich-text content. Matches the Tiptap extensions
 * used in the write-kudos dialog: StarterKit (p, strong, em, s, ol, ul, li,
 * blockquote, br) + Link + Mention.
 *
 * Mention chips render as <span data-type="mention" data-id="<uuid>">@Name</span>.
 */
const ALLOWED_TAGS = [
  "p",
  "strong",
  "em",
  "s",
  "ol",
  "ul",
  "li",
  "blockquote",
  "br",
  "a",
  "span",
] as const;

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "class",
  "data-type",
  "data-id",
] as const;

export function sanitizeKudosHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["script", "style", "iframe"],
    FORBID_ATTR: ["onerror", "onclick", "onload"],
    // Strict: only the data-type and data-id attrs explicitly listed in
    // ALLOWED_ATTR survive. Blocks arbitrary data-* injections.
    ALLOW_DATA_ATTR: false,
  });
}

/** Strip every tag — used by the server action to validate non-empty content. */
export function stripKudosHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}
