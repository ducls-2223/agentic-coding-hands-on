import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Regression guard for the write-kudos toolbar icons.
 *
 * These SVGs render via next/image (<img>), so the button's `text-*` class
 * cannot recolor them — the fill baked into the asset IS the on-screen color.
 * They were originally exported with `fill="white"`, which made them invisible
 * on the white toolbar. The design renders them in the foreground `#00101A`.
 */
const ICON_DIR = join(process.cwd(), "public", "kudos", "editor");
const TOOLBAR_ICONS = [
  "bold",
  "italic",
  "strikethrough",
  "number-list",
  "link",
  "quote",
];
const DESIGN_FOREGROUND = "#00101A";

describe("write-kudos toolbar icon assets", () => {
  it.each(TOOLBAR_ICONS)(
    "%s.svg uses the design foreground fill, never invisible white",
    (name) => {
      const svg = readFileSync(join(ICON_DIR, `${name}.svg`), "utf8");
      // The stroke/path fill must be the dark design color...
      expect(svg).toContain(`fill="${DESIGN_FOREGROUND}"`);
      // ...and must not be white (invisible on the white toolbar). The root
      // <svg fill="none"> is fine; only a white shape fill is the defect.
      expect(svg).not.toContain('fill="white"');
      expect(svg.toLowerCase()).not.toContain('fill="#fff');
    },
  );
});
