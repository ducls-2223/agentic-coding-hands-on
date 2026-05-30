import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Regression guard for the floating-action-widget "Viết KUDOS" pen icon.
 *
 * widget-pen.svg renders via next/image on the yellow #FFEA9E button (with
 * dark #00101A text), so a CSS class cannot recolor it — the asset fill is the
 * on-screen color. It shipped as fill="white" (invisible/wrong on yellow); the
 * design draws the pencil in the dark foreground.
 */
const WIDGET_DIR = join(process.cwd(), "public", "widget");
const DESIGN_FOREGROUND = "#00101A";

describe("floating-action-widget icon assets", () => {
  it("widget-pen.svg uses the dark design foreground, not white", () => {
    const svg = readFileSync(join(WIDGET_DIR, "widget-pen.svg"), "utf8");
    expect(svg).toContain(`fill="${DESIGN_FOREGROUND}"`);
    expect(svg).not.toContain('fill="white"');
    expect(svg.toLowerCase()).not.toContain('fill="#fff');
  });
});
