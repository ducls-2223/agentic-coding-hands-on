import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/sun-kudos/_components/kudos-action-bar", () => ({
  KudosActionBar: stub("KudosActionBar"),
}));

import { KudosCard } from "@/app/sun-kudos/_components/kudos-card";

const ITEM = {
  id: "k1",
  sender: { name: "Alice", level: "Hero", badge: "Bronze", avatar: "/a.png" },
  receiver: { name: "Bob", level: "Hero", badge: "Silver", avatar: "/b.png" },
  message: "Great work team!",
  hashtags: ["#shipit", "#teamwork"],
  likes: 3,
  timestamp: "5 minutes ago",
  images: ["/img1.png", "/img2.png"],
};

describe("KudosCard", () => {
  it("renders sender + receiver names, message, timestamp", () => {
    render(<KudosCard item={ITEM} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Great work team!")).toBeInTheDocument();
    expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
  });

  it("renders each hashtag", () => {
    render(<KudosCard item={ITEM} />);
    expect(screen.getByText("#shipit")).toBeInTheDocument();
    expect(screen.getByText("#teamwork")).toBeInTheDocument();
  });

  it("renders gallery thumbnails for the feed variant", () => {
    render(<KudosCard item={ITEM} variant="feed" />);
    const imgs = screen.getAllByTestId("NextImage");
    // sender avatar + receiver avatar + sent arrow + 2 gallery
    expect(imgs.length).toBeGreaterThanOrEqual(5);
  });

  it("omits gallery for the highlight variant", () => {
    render(<KudosCard item={ITEM} variant="highlight" />);
    const imgs = screen.getAllByTestId("NextImage");
    // sender avatar + receiver avatar + sent arrow (no gallery)
    expect(imgs.length).toBe(3);
  });

  it("passes showViewDetails through to the action bar", () => {
    render(<KudosCard item={ITEM} variant="highlight" />);
    const bar = screen.getByTestId("KudosActionBar");
    expect(bar).toHaveAttribute("data-prop-showviewdetails", "true");
  });
});
