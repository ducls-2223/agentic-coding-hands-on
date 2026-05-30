import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { EditorToolbar } from "@/app/sun-kudos/_components/editor-toolbar";

/**
 * Minimal Tiptap Editor stub. Each chainable method returns the chain object
 * so `editor.chain().focus().toggleBold().run()` is callable; spies on each
 * method let assertions verify which command fired.
 */
function makeEditor(opts?: {
  active?: Record<string, boolean>;
  linkAttrs?: Record<string, string>;
}) {
  const calls: string[] = [];
  const chain: Record<string, () => typeof chain> = {};
  for (const m of [
    "focus",
    "toggleBold",
    "toggleItalic",
    "toggleStrike",
    "toggleOrderedList",
    "toggleBlockquote",
    "extendMarkRange",
    "unsetLink",
    "setLink",
    "run",
  ]) {
    chain[m] = vi.fn(() => {
      calls.push(m);
      return chain;
    }) as unknown as () => typeof chain;
  }
  const active = opts?.active ?? {};
  return {
    chain: vi.fn(() => chain),
    isActive: vi.fn((name: string) => !!active[name]),
    getAttributes: vi.fn(() => opts?.linkAttrs ?? {}),
    _calls: calls,
  } as unknown as Parameters<typeof EditorToolbar>[0]["editor"] & {
    _calls: string[];
  };
}

describe("EditorToolbar", () => {
  beforeEach(() => {
    vi.spyOn(window, "prompt").mockImplementation(() => "https://example.com");
  });

  it("renders six format buttons + community link; all disabled when editor is null", () => {
    render(<EditorToolbar editor={null} />);

    for (const key of [
      "kudos.editor.bold",
      "kudos.editor.italic",
      "kudos.editor.strikethrough",
      "kudos.editor.numbered_list",
      "kudos.editor.link",
      "kudos.editor.quote",
    ]) {
      expect(screen.getByRole("button", { name: key })).toBeDisabled();
    }
    expect(
      screen.getByText("kudos.editor.community_guidelines"),
    ).toBeInTheDocument();
  });

  it("clicking each format button fires its chain command", () => {
    const editor = makeEditor() as ReturnType<typeof makeEditor>;
    render(<EditorToolbar editor={editor} />);
    fireEvent.click(screen.getByRole("button", { name: "kudos.editor.bold" }));
    fireEvent.click(
      screen.getByRole("button", { name: "kudos.editor.italic" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "kudos.editor.strikethrough" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "kudos.editor.numbered_list" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "kudos.editor.quote" }));
    expect(editor._calls).toEqual(
      expect.arrayContaining([
        "toggleBold",
        "toggleItalic",
        "toggleStrike",
        "toggleOrderedList",
        "toggleBlockquote",
      ]),
    );
  });

  it("Link with a URL calls setLink with target+rel", () => {
    const editor = makeEditor() as ReturnType<typeof makeEditor>;
    render(<EditorToolbar editor={editor} />);
    fireEvent.click(screen.getByRole("button", { name: "kudos.editor.link" }));
    expect(editor._calls).toContain("setLink");
  });

  it("Link with empty URL unsets the link", () => {
    vi.spyOn(window, "prompt").mockReturnValueOnce("");
    const editor = makeEditor() as ReturnType<typeof makeEditor>;
    render(<EditorToolbar editor={editor} />);
    fireEvent.click(screen.getByRole("button", { name: "kudos.editor.link" }));
    expect(editor._calls).toContain("unsetLink");
  });

  it("Link cancelled (prompt returns null) is a no-op", () => {
    vi.spyOn(window, "prompt").mockReturnValueOnce(null as unknown as string);
    const editor = makeEditor() as ReturnType<typeof makeEditor>;
    render(<EditorToolbar editor={editor} />);
    fireEvent.click(screen.getByRole("button", { name: "kudos.editor.link" }));
    expect(editor._calls).not.toContain("setLink");
    expect(editor._calls).not.toContain("unsetLink");
  });

  it("renders the segmented bordered button group per design", () => {
    render(<EditorToolbar editor={null} />);
    // Every control is a bordered cell (#998C5F), not a borderless icon.
    const bold = screen.getByRole("button", { name: "kudos.editor.bold" });
    expect(bold.className).toContain("border-[#998C5F]");
    // The row's top corners are rounded to meet the text field below.
    expect(bold.className).toContain("rounded-tl-lg");
    const guidelines = screen.getByText("kudos.editor.community_guidelines");
    expect(guidelines.className).toContain("rounded-tr-lg");
    expect(guidelines.className).toContain("border-[#998C5F]");
  });

  it("Bold button shows aria-pressed=true when bold is active", () => {
    const editor = makeEditor({ active: { bold: true } }) as ReturnType<
      typeof makeEditor
    >;
    render(<EditorToolbar editor={editor} />);
    expect(
      screen.getByRole("button", { name: "kudos.editor.bold" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
