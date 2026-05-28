import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../../helpers/stub-component";
import { fakeT } from "../../helpers/mock-i18n";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { KudosSidebar } from "@/app/sun-kudos/_components/kudos-sidebar";

const STATS = {
  received: 4,
  sent: 7,
  hearts: 11,
  secretBoxOpened: 1,
  secretBoxUnopened: 2,
};

const RANKUPS = [
  { rank: 1, name: "Alice", level: "Hero", avatar: "/a.png", note: "+1" },
  { rank: 2, name: "Charlie", level: "Hero", avatar: "/c.png", note: "+0" },
];

const GIFTS = [{ rank: 1, name: "Bob", level: "Hero", avatar: "/b.png", note: "+2" }];

describe("KudosSidebar", () => {
  it("renders each numeric stat", async () => {
    const ui = await KudosSidebar({ stats: STATS, rankups: RANKUPS, gifts: GIFTS });
    render(ui);
    // Distinct stat values that don't collide with rank numbers.
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
  });

  it("renders rankups and gifts headings + rows", async () => {
    const ui = await KudosSidebar({ stats: STATS, rankups: RANKUPS, gifts: GIFTS });
    render(ui);
    expect(screen.getByText("sun_kudos.sidebar.rankups_title")).toBeInTheDocument();
    expect(screen.getByText("sun_kudos.sidebar.gifts_title")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
