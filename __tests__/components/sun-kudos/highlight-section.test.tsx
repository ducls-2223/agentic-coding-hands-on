import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/sun-kudos/_components/kudos-card", () => ({
  KudosCard: ({ item }: { item: { id: string; receiver: { name: string } } }) => (
    <div data-testid="KudosCard">{item.receiver.name}</div>
  ),
}));
vi.mock("@/app/sun-kudos/_components/department-filter", () => ({
  DepartmentFilter: ({ onChange }: { onChange: (v: string | null) => void }) => (
    <div>
      <button data-testid="dept-eng" onClick={() => onChange("ENG")}>ENG</button>
      <button data-testid="dept-clear" onClick={() => onChange(null)}>clear</button>
    </div>
  ),
}));
vi.mock("@/app/sun-kudos/_components/hashtag-filter", () => ({
  HashtagFilter: ({ onChange }: { onChange: (v: string[]) => void }) => (
    <div>
      <button data-testid="ht-pick" onClick={() => onChange(["#shipit"])}>pick</button>
      <button data-testid="ht-clear" onClick={() => onChange([])}>clear</button>
    </div>
  ),
}));

import { HighlightSection } from "@/app/sun-kudos/_components/highlight-section";

function makeItem(id: string, dept = "ENG", hashtags: string[] = []) {
  return {
    id,
    sender: { name: "S", level: "L", badge: "B", avatar: "/a.png" },
    receiver: { name: `R-${id}`, level: "L", badge: "B", avatar: "/b.png", department: dept },
    message: "hi",
    hashtags,
    likes: 0,
    timestamp: "now",
  };
}

describe("HighlightSection", () => {
  it("renders empty state when no items", () => {
    render(<HighlightSection items={[]} />);
    expect(screen.getByText("sun_kudos.empty")).toBeInTheDocument();
  });

  it("renders all items as KudosCards when there are multiple", () => {
    render(<HighlightSection items={[makeItem("1"), makeItem("2"), makeItem("3")]} />);
    expect(screen.getAllByTestId("KudosCard")).toHaveLength(3);
  });

  it("shows pagination controls when more than one item", () => {
    render(<HighlightSection items={[makeItem("1"), makeItem("2")]} />);
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("advances the index via next button", () => {
    render(<HighlightSection items={[makeItem("1"), makeItem("2")]} />);
    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.card.next" }));
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  it("disables next at the last item", () => {
    render(<HighlightSection items={[makeItem("1"), makeItem("2")]} />);
    const nextBtn = screen.getByRole("button", { name: "sun_kudos.card.next" });
    fireEvent.click(nextBtn);
    expect(nextBtn).toBeDisabled();
  });

  it("hides pagination when only one item passes the filter", () => {
    render(<HighlightSection items={[makeItem("1")]} />);
    expect(screen.queryByText("1/1")).not.toBeInTheDocument();
  });

  it("filters by department and resets index to 0", () => {
    render(
      <HighlightSection
        items={[makeItem("1", "ENG"), makeItem("2", "DESIGN"), makeItem("3", "ENG")]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.card.next" }));
    expect(screen.getByText("2/3")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("dept-eng"));
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("filters by hashtags and resets index to 0", () => {
    render(
      <HighlightSection
        items={[
          makeItem("1", "ENG", ["#shipit"]),
          makeItem("2", "ENG", ["#other"]),
          makeItem("3", "ENG", ["#shipit"]),
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.card.next" }));
    fireEvent.click(screen.getByTestId("ht-pick"));
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("shows empty state when filters exclude everything", () => {
    render(<HighlightSection items={[makeItem("1", "ENG")]} />);
    fireEvent.click(screen.getByTestId("ht-pick"));
    expect(screen.getByText("sun_kudos.empty")).toBeInTheDocument();
  });
});
