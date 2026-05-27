// Hashtags surfaced by the highlight-section multi-select filter.
// Superset of the tags used by HIGHLIGHT_KUDOS mock data so the filter has
// meaningful matches, plus extras drawn from the Figma spec for visual
// fidelity. Names are treated as proper-noun-like tokens — not translated.
export const AVAILABLE_HASHTAGS = [
  "#Dedicated",
  "#Teamwork",
  "#Inspiring",
  "#Mentor",
  "#Creative",
  "#High-performing",
  "#BeProfessional",
  "#BeOptimistic",
  "#BeATeam",
  "#ThinkOutsideTheBox",
  "#GetRisky",
  "#GoFast",
  "#Wasshoi",
] as const;

export type AvailableHashtag = (typeof AVAILABLE_HASHTAGS)[number];

// Invariant: must be > 0. Setting this to 0 would disable every unselected
// row on first render and silently break the filter UI.
export const MAX_HASHTAG_FILTERS = 5;
