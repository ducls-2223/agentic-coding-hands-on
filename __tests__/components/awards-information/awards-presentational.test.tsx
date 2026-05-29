import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../../helpers/stub-component";
import { fakeT } from "../../helpers/mock-i18n";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/_components/localized-link", () => ({ LocalizedLink: stub("LocalizedLink") }));

import { AwardsKeyvisual } from "@/app/awards-information/_components/awards-keyvisual";
import { AwardsKudosBanner } from "@/app/awards-information/_components/awards-kudos-banner";
import { AwardsLayout } from "@/app/awards-information/_components/awards-layout";
import { AwardsTitle } from "@/app/awards-information/_components/awards-title";

describe("Awards-information presentational components", () => {
  it("AwardsKeyvisual renders background image + ROOT FURTHER + children", () => {
    render(
      <AwardsKeyvisual>
        <div data-testid="child" />
      </AwardsKeyvisual>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getAllByTestId("NextImage").length).toBeGreaterThanOrEqual(2);
  });

  it("AwardsKudosBanner renders the CTA link to /sun-kudos", async () => {
    const ui = await AwardsKudosBanner();
    render(ui);
    expect(screen.getByTestId("LocalizedLink")).toHaveAttribute("data-prop-href", "/sun-kudos");
  });

  it("AwardsLayout places menu beside children", () => {
    render(
      <AwardsLayout menu={<nav data-testid="menu" />}>
        <p data-testid="content">x</p>
      </AwardsLayout>,
    );
    expect(screen.getByTestId("menu")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("AwardsTitle renders subtitle + heading", async () => {
    const ui = await AwardsTitle();
    render(ui);
    expect(screen.getByText("awards.subtitle")).toBeInTheDocument();
    expect(screen.getByRole("heading")).toHaveTextContent("awards.title_full");
  });
});
