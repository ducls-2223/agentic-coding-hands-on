import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../../helpers/stub-component";
import { fakeT } from "../../helpers/mock-i18n";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { AwardDetail } from "@/app/awards-information/_components/award-detail";

const BASE = {
  slug: "mvp",
  title: "MVP",
  description: "Most Valuable Person",
  count: 1,
  unit: null,
  valueText: "15,000,000 VND",
  valueSuffix: "per award",
  image: "/mvp.png",
};

describe("AwardDetail", () => {
  it("renders title, description, valueText and section id", async () => {
    const ui = await AwardDetail(BASE);
    const { container } = render(ui);

    expect(screen.getByRole("heading", { name: "MVP" })).toBeInTheDocument();
    expect(screen.getByText("Most Valuable Person")).toBeInTheDocument();
    expect(screen.getByText("15,000,000 VND")).toBeInTheDocument();
    expect(container.querySelector("section")).toHaveAttribute("id", "mvp");
  });

  it("pads count with leading zero and appends unit when present", async () => {
    const ui = await AwardDetail({ ...BASE, count: 3, unit: "winners" });
    render(ui);
    expect(screen.getByText("03 winners")).toBeInTheDocument();
  });

  it("omits unit when null", async () => {
    const ui = await AwardDetail({ ...BASE, count: 7, unit: null });
    render(ui);
    expect(screen.getByText("07")).toBeInTheDocument();
  });

  it("reverses layout when imageRight=true", async () => {
    const ui = await AwardDetail({ ...BASE, imageRight: true });
    const { container } = render(ui);
    expect(container.innerHTML).toContain("flex-row-reverse");
  });
});
