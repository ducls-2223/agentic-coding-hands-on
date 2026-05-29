import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { EditorToolbar } from "@/app/sun-kudos/_components/editor-toolbar";

describe("EditorToolbar", () => {
  it("renders six format buttons plus the community link", () => {
    // Disabled state: passing null editor — every toolbar button shows as
    // disabled but the labels + community link are still asserted.
    render(<EditorToolbar editor={null} />);
    expect(
      screen.getByRole("button", { name: "kudos.editor.bold" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "kudos.editor.italic" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "kudos.editor.strikethrough" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "kudos.editor.numbered_list" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "kudos.editor.link" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "kudos.editor.quote" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("kudos.editor.community_guidelines"),
    ).toBeInTheDocument();
  });
});
