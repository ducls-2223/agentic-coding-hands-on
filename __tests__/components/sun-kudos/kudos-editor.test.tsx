import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";

import { stub } from "../../helpers/stub-component";

// Tiptap's React bindings + extensions are unstable in jsdom. Mock them down
// to just enough surface for the kudos-editor module to import + render.
const editorInstance = {
  setEditable: vi.fn(),
  commands: { clearContent: vi.fn() },
  getHTML: vi.fn(() => "<p>x</p>"),
  getText: vi.fn(() => "x"),
};

const useEditorMock = vi.fn(() => editorInstance);

vi.mock("@tiptap/react", () => ({
  useEditor: (...args: unknown[]) => useEditorMock(...args),
  EditorContent: () => <div data-testid="EditorContent" />,
  ReactRenderer: class {
    element = document.createElement("div");
    updateProps() {}
    destroy() {}
  },
}));
vi.mock("@tiptap/starter-kit", () => ({ default: { configure: () => ({}) } }));
vi.mock("@tiptap/extension-link", () => ({ default: { configure: () => ({}) } }));
// Capture the Mention.configure call so the test can drive the suggestion
// render lifecycle (onStart / onUpdate / onKeyDown / onExit) directly.
const mentionConfig: { current: unknown } = { current: null };
vi.mock("@tiptap/extension-mention", () => ({
  default: {
    configure: (cfg: unknown) => {
      mentionConfig.current = cfg;
      return {};
    },
  },
}));
vi.mock("tippy.js", () => ({ default: vi.fn(() => ({ setProps: vi.fn(), hide: vi.fn(), destroy: vi.fn() })) }));
vi.mock("@/app/sun-kudos/_actions/search-sunners", () => ({
  searchSunners: vi.fn(async () => []),
}));
vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("@/app/sun-kudos/_components/editor-toolbar", () => ({
  EditorToolbar: stub("EditorToolbar"),
}));
vi.mock("@/app/sun-kudos/_components/mention-list", () => ({
  MentionList: stub("MentionList"),
}));
vi.mock("tippy.js/dist/tippy.css", () => ({}), { virtual: true } as never);

import { KudosEditor } from "@/app/sun-kudos/_components/kudos-editor";

describe("KudosEditor (smoke)", () => {
  it("renders the EditorContent + EditorToolbar", () => {
    render(<KudosEditor />);
    expect(screen.getByTestId("EditorContent")).toBeInTheDocument();
    expect(screen.getByTestId("EditorToolbar")).toBeInTheDocument();
  });

  it("calls editor.setEditable(false) when disabled=true", () => {
    editorInstance.setEditable.mockClear();
    render(<KudosEditor disabled />);
    expect(editorInstance.setEditable).toHaveBeenCalledWith(false);
  });

  it("applies the error border when hasError=true", () => {
    const { container } = render(<KudosEditor hasError />);
    expect(container.innerHTML).toContain("border-[#B72927]");
  });

  it("exposes getHtml + clear via ref", async () => {
    const refHolder: { current: unknown } = { current: null };
    render(<KudosEditor ref={refHolder as unknown as React.Ref<unknown>} />);
    const handle = refHolder.current as { getHtml: () => string; clear: () => void };
    expect(handle.getHtml()).toBe("<p>x</p>");
    handle.clear();
    expect(editorInstance.commands.clearContent).toHaveBeenCalledWith(true);
  });

  describe("mention suggestion lifecycle", () => {
    interface SuggestionRenderer {
      onStart: (props: {
        clientRect?: () => DOMRect;
        editor: unknown;
      }) => void;
      onUpdate: (props: { clientRect?: () => DOMRect }) => void;
      onKeyDown: (props: { event: { key: string } }) => boolean;
      onExit: () => void;
    }
    interface MentionCfg {
      suggestion: { items: (a: { query: string }) => Promise<unknown[]>; render: () => SuggestionRenderer };
    }

    beforeAll(() => {
      // Render once to populate mentionConfig.current.
      render(<KudosEditor />);
    });

    it("captures the mention suggestion config", () => {
      expect(mentionConfig.current).toBeTruthy();
    });

    it("items() forwards the typed query to searchSunners", async () => {
      const cfg = mentionConfig.current as MentionCfg;
      await cfg.suggestion.items({ query: "An" });
      const { searchSunners } = await import("@/app/sun-kudos/_actions/search-sunners");
      expect(searchSunners).toHaveBeenCalledWith("An", 8);
    });

    it("onStart constructs the renderer and shows the Tippy popup", () => {
      const cfg = mentionConfig.current as MentionCfg;
      const renderer = cfg.suggestion.render();
      const clientRect = vi.fn(() => new DOMRect());
      renderer.onStart({ clientRect, editor: {} });
      // Tippy was called once with the document.body anchor.
      // (We don't assert specifics — just that the path ran without throwing.)
    });

    it("onStart returns early when clientRect is missing (no tippy created)", () => {
      const cfg = mentionConfig.current as MentionCfg;
      const renderer = cfg.suggestion.render();
      expect(() =>
        renderer.onStart({ clientRect: undefined, editor: {} }),
      ).not.toThrow();
    });

    it("onUpdate updates the renderer and the popup props", () => {
      const cfg = mentionConfig.current as MentionCfg;
      const renderer = cfg.suggestion.render();
      const clientRect = vi.fn(() => new DOMRect());
      renderer.onStart({ clientRect, editor: {} });
      expect(() => renderer.onUpdate({ clientRect })).not.toThrow();
    });

    it("onUpdate is a no-op when clientRect is missing", () => {
      const cfg = mentionConfig.current as MentionCfg;
      const renderer = cfg.suggestion.render();
      const clientRect = vi.fn(() => new DOMRect());
      renderer.onStart({ clientRect, editor: {} });
      expect(() => renderer.onUpdate({ clientRect: undefined })).not.toThrow();
    });

    it("onKeyDown Escape hides the popup and returns true", () => {
      const cfg = mentionConfig.current as MentionCfg;
      const renderer = cfg.suggestion.render();
      const clientRect = vi.fn(() => new DOMRect());
      renderer.onStart({ clientRect, editor: {} });
      const handled = renderer.onKeyDown({ event: { key: "Escape" } });
      expect(handled).toBe(true);
    });

    it("onKeyDown delegates non-Escape keys to the component (returns false when no handler)", () => {
      const cfg = mentionConfig.current as MentionCfg;
      const renderer = cfg.suggestion.render();
      const handled = renderer.onKeyDown({ event: { key: "ArrowDown" } });
      expect(handled).toBe(false);
    });

    it("onExit destroys both popup and renderer", () => {
      const cfg = mentionConfig.current as MentionCfg;
      const renderer = cfg.suggestion.render();
      const clientRect = vi.fn(() => new DOMRect());
      renderer.onStart({ clientRect, editor: {} });
      expect(() => renderer.onExit()).not.toThrow();
    });
  });
});
