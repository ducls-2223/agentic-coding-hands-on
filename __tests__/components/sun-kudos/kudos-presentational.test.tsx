import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../../helpers/stub-component";
import { fakeT } from "../../helpers/mock-i18n";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/sun-kudos/_components/kudos-card", () => ({ KudosCard: stub("KudosCard") }));
vi.mock("@/app/sun-kudos/_components/kudos-sidebar", () => ({ KudosSidebar: stub("KudosSidebar") }));

import { SpotlightBoard } from "@/app/sun-kudos/_components/spotlight-board";
import { KudosKeyvisual } from "@/app/sun-kudos/_components/kudos-keyvisual";
import { AllKudosSection } from "@/app/sun-kudos/_components/all-kudos-section";

const STATS = {
  received: 4,
  sent: 7,
  hearts: 11,
  secretBoxOpened: 1,
  secretBoxUnopened: 2,
};

const ITEM = {
  id: "k1",
  sender: { name: "Alice", level: "Hero", badge: "B", avatar: "/a.png" },
  receiver: { name: "Bob", level: "Hero", badge: "B", avatar: "/b.png" },
  message: "great",
  hashtags: [],
  likes: 0,
  timestamp: "now",
};

const RANKUP = { rank: 1, name: "Alice", level: "Hero", avatar: "/x.png", note: "+1" };
const GIFT = { rank: 1, name: "Bob", level: "Hero", avatar: "/y.png", note: "+2" };

describe("SpotlightBoard", () => {
  it("renders the count chip and the title", async () => {
    const ui = await SpotlightBoard({ totalCount: 388 });
    render(ui);
    expect(screen.getByText("388 KUDOS")).toBeInTheDocument();
    expect(screen.getByRole("heading")).toHaveTextContent("sun_kudos.spotlight_title");
  });

  it("renders the static word cloud (28 spans)", async () => {
    const ui = await SpotlightBoard({ totalCount: 0 });
    const { container } = render(ui);
    expect(container.querySelectorAll(".absolute span").length).toBeGreaterThanOrEqual(28);
  });
});

describe("KudosKeyvisual", () => {
  it("renders the title image and forwards children", async () => {
    const ui = await KudosKeyvisual({ children: <span data-testid="child" /> });
    render(ui);
    expect(screen.getByText("sun_kudos.kv_title")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

describe("AllKudosSection", () => {
  it("renders one KudosCard per item", async () => {
    const items = [ITEM, { ...ITEM, id: "k2" }];
    const ui = await AllKudosSection({
      items,
      stats: STATS,
      rankups: [RANKUP],
      gifts: [GIFT],
    });
    render(ui);
    expect(screen.getAllByTestId("KudosCard")).toHaveLength(2);
  });
});
