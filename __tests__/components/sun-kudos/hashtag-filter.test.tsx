import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { HashtagFilter } from "@/app/sun-kudos/_components/hashtag-filter";
import {
  AVAILABLE_HASHTAGS,
  MAX_HASHTAG_FILTERS,
} from "@/app/sun-kudos/_data/hashtags";

describe("HashtagFilter", () => {
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
  });

  it("renders the bare label when no hashtag is selected", () => {
    render(<HashtagFilter value={[]} onChange={onChange} />);
    expect(screen.getByRole("button")).toHaveTextContent("kudos.dialog.hashtag_button");
  });

  it("shows the selected count badge in the trigger label", () => {
    render(
      <HashtagFilter value={[AVAILABLE_HASHTAGS[0], AVAILABLE_HASHTAGS[1]]} onChange={onChange} />,
    );
    expect(screen.getByRole("button")).toHaveTextContent("(2)");
  });

  it("opens the listbox on trigger click and lists all hashtags", () => {
    render(<HashtagFilter value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getAllByRole("option")).toHaveLength(AVAILABLE_HASHTAGS.length);
  });

  it("calls onChange with the selected tag added", () => {
    render(<HashtagFilter value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: AVAILABLE_HASHTAGS[0] }));

    expect(onChange).toHaveBeenCalledWith([AVAILABLE_HASHTAGS[0]]);
  });

  it("removes a tag when clicked while selected", () => {
    render(<HashtagFilter value={[AVAILABLE_HASHTAGS[0]]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: AVAILABLE_HASHTAGS[0] }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("disables un-selected options once the cap is reached", () => {
    const atCap = AVAILABLE_HASHTAGS.slice(0, MAX_HASHTAG_FILTERS);
    render(<HashtagFilter value={atCap} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));

    const unselected = screen.getByRole("option", {
      name: AVAILABLE_HASHTAGS[MAX_HASHTAG_FILTERS],
    });
    expect(unselected).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(unselected);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("toggles a tag via Enter key", () => {
    render(<HashtagFilter value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    const opt = screen.getByRole("option", { name: AVAILABLE_HASHTAGS[0] });
    fireEvent.keyDown(opt, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith([AVAILABLE_HASHTAGS[0]]);
  });

  it("closes the listbox on outside mousedown", () => {
    render(
      <div>
        <HashtagFilter value={[]} onChange={onChange} />
        <div data-testid="outside">x</div>
      </div>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("toggles via Space key", () => {
    render(<HashtagFilter value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    const opt = screen.getByRole("option", { name: AVAILABLE_HASHTAGS[0] });
    fireEvent.keyDown(opt, { key: " " });
    expect(onChange).toHaveBeenCalledWith([AVAILABLE_HASHTAGS[0]]);
  });

  it("does not toggle for disabled options on Enter", () => {
    const atCap = AVAILABLE_HASHTAGS.slice(0, 5);
    render(<HashtagFilter value={atCap} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    const disabledOpt = screen.getByRole("option", { name: AVAILABLE_HASHTAGS[5] });
    fireEvent.keyDown(disabledOpt, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
