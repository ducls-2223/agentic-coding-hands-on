import { describe, it, expect } from "vitest";
import { sanitizeKudosHtml, stripKudosHtml } from "@/lib/sanitize-kudos-html";

describe("sanitizeKudosHtml", () => {
  it("preserves allowed inline marks (strong, em, s)", () => {
    const out = sanitizeKudosHtml("<p><strong>bold</strong> <em>italic</em> <s>strike</s></p>");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>italic</em>");
    expect(out).toContain("<s>strike</s>");
  });

  it("preserves ordered/unordered lists and blockquotes", () => {
    const out = sanitizeKudosHtml(
      "<ol><li>one</li></ol><ul><li>two</li></ul><blockquote>q</blockquote>",
    );
    expect(out).toContain("<ol>");
    expect(out).toContain("<ul>");
    expect(out).toContain("<blockquote>");
  });

  it("preserves <a href> with target+rel attributes", () => {
    const out = sanitizeKudosHtml(
      '<a href="https://example.com" target="_blank" rel="noopener">link</a>',
    );
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
  });

  it("preserves Tiptap mention chip data-type + data-id", () => {
    const out = sanitizeKudosHtml(
      '<span data-type="mention" data-id="00000000-0000-0000-0000-000000000001">@Alice</span>',
    );
    expect(out).toContain('data-type="mention"');
    expect(out).toContain('data-id="00000000-0000-0000-0000-000000000001"');
    expect(out).toContain("@Alice");
  });

  it("strips <script> entirely", () => {
    const out = sanitizeKudosHtml("<p>hi</p><script>alert(1)</script>");
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toContain("alert(1)");
  });

  it("strips inline event handlers (onerror, onclick)", () => {
    const out = sanitizeKudosHtml('<a href="x" onerror="alert(1)" onclick="x()">bad</a>');
    expect(out).not.toMatch(/onerror/i);
    expect(out).not.toMatch(/onclick/i);
  });

  it("strips javascript: URLs from href", () => {
    const out = sanitizeKudosHtml(
      '<a href="javascript:alert(1)">click</a>',
    );
    expect(out).not.toMatch(/javascript:/i);
  });

  it("strips unlisted data-* attributes (ALLOW_DATA_ATTR=false)", () => {
    const out = sanitizeKudosHtml('<span data-evil="1" data-type="mention">x</span>');
    expect(out).not.toContain('data-evil="1"');
    expect(out).toContain('data-type="mention"');
  });

  it("strips <iframe>, <style>", () => {
    const out = sanitizeKudosHtml(
      "<iframe src=\"https://evil\"></iframe><style>body{}</style>",
    );
    expect(out).not.toMatch(/<iframe/i);
    expect(out).not.toMatch(/<style/i);
  });
});

describe("stripKudosHtml", () => {
  it("returns plain text with no tags", () => {
    const out = stripKudosHtml("<p>Hello <strong>world</strong></p>");
    expect(out).toBe("Hello world");
  });

  it("returns empty string for tag-only / empty input", () => {
    expect(stripKudosHtml("<p></p>")).toBe("");
    expect(stripKudosHtml("")).toBe("");
    expect(stripKudosHtml("   ")).toBe("");
  });

  it("trims surrounding whitespace", () => {
    expect(stripKudosHtml("<p>  hi  </p>")).toBe("hi");
  });
});
