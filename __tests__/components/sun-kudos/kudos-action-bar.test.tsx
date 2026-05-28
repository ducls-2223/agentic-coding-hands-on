import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { KudosActionBar } from "@/app/sun-kudos/_components/kudos-action-bar";

describe("KudosActionBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders initial like count", () => {
    render(<KudosActionBar kudosId="k1" initialLikes={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("toggles the like count and aria-pressed", () => {
    render(<KudosActionBar kudosId="k1" initialLikes={5} />);
    const likeButton = screen.getByRole("button", { name: "sun_kudos.card.like" });
    fireEvent.click(likeButton);
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "sun_kudos.card.unlike" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("unlikes (decrements) after second click", () => {
    render(<KudosActionBar kudosId="k1" initialLikes={5} />);
    const like = screen.getByRole("button", { name: "sun_kudos.card.like" });
    fireEvent.click(like);
    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.card.unlike" }));
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("copies link and shows toast on success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<KudosActionBar kudosId="k1" initialLikes={0} />);

    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.card.copy_link" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/sun-kudos/k1"));
    expect(screen.getByRole("status")).toHaveTextContent("common.link_copied");
  });

  it("shows view-details toast when showViewDetails=true", () => {
    render(<KudosActionBar kudosId="k1" initialLikes={0} showViewDetails />);
    fireEvent.click(screen.getByText(/common\.view_details/));
    expect(screen.getByRole("status")).toHaveTextContent("sun_kudos.detail_coming_soon");
  });

  it("falls back to 'copy_link' toast when clipboard is unavailable", async () => {
    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    render(<KudosActionBar kudosId="k1" initialLikes={0} />);
    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.card.copy_link" }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("status")).toHaveTextContent("common.copy_link");
  });

  it("auto-dismisses toast after 2s", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<KudosActionBar kudosId="k1" initialLikes={0} />);

    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.card.copy_link" }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
