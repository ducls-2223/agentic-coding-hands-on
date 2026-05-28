import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { HashtagChips } from "@/app/sun-kudos/_components/hashtag-chips";

describe("HashtagChips", () => {
  let onChange: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    onChange = vi.fn();
  });

  it("renders an empty list with just the add button", () => {
    render(<HashtagChips tags={[]} onChange={onChange} />);
    expect(screen.getByText("kudos.dialog.hashtag_button")).toBeInTheDocument();
  });

  it("renders existing tags with remove buttons", () => {
    render(<HashtagChips tags={["#alpha", "#beta"]} onChange={onChange} />);
    expect(screen.getByText("#alpha")).toBeInTheDocument();
    expect(screen.getByText("#beta")).toBeInTheDocument();
  });

  it("removes a tag when its X is clicked", () => {
    render(<HashtagChips tags={["#alpha", "#beta"]} onChange={onChange} />);
    const removeButtons = screen.getAllByRole("button", { name: /remove_hashtag/ });
    fireEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(["#beta"]);
  });

  it("hides the add button at max", () => {
    render(<HashtagChips tags={["#a", "#b", "#c", "#d", "#e"]} onChange={onChange} max={5} />);
    expect(screen.queryByText("kudos.dialog.hashtag_button")).not.toBeInTheDocument();
  });

  it("commits a new hashtag on Enter", () => {
    render(<HashtagChips tags={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("kudos.dialog.hashtag_button"));
    const input = screen.getByPlaceholderText("Inspiring");
    fireEvent.change(input, { target: { value: "shipit" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["#shipit"]);
  });

  it("ignores empty input on Enter", () => {
    render(<HashtagChips tags={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("kudos.dialog.hashtag_button"));
    const input = screen.getByPlaceholderText("Inspiring");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Escape cancels editing without committing", () => {
    render(<HashtagChips tags={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("kudos.dialog.hashtag_button"));
    const input = screen.getByPlaceholderText("Inspiring");
    fireEvent.change(input, { target: { value: "discard" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("strips leading # and ignores duplicates", () => {
    render(<HashtagChips tags={["#alpha"]} onChange={onChange} />);
    fireEvent.click(screen.getByText("kudos.dialog.hashtag_button"));
    const input = screen.getByPlaceholderText("Inspiring");
    fireEvent.change(input, { target: { value: "##alpha" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
