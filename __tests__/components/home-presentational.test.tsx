import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../helpers/stub-component";
import { fakeT } from "../helpers/mock-i18n";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/_components/localized-link", () => ({ LocalizedLink: stub("LocalizedLink") }));
vi.mock("@/app/_components/countdown-timer", () => ({ CountdownTimer: stub("CountdownTimer") }));
vi.mock("@/app/_components/user-menu", () => ({ UserMenu: stub("UserMenu") }));
vi.mock("@/app/_components/language-switcher", () => ({ LanguageSwitcher: stub("LanguageSwitcher") }));
vi.mock("@/app/(home)/_actions/sign-out", () => ({ signOut: vi.fn() }));

// AwardCard itself is tested separately below; here we only need to assert
// that AwardsSection renders 6 of them. Stub keeps the section sync.
vi.mock("@/app/_components/award-card", async () => {
  const actual = await vi.importActual<typeof import("@/app/_components/award-card")>(
    "@/app/_components/award-card",
  );
  return {
    ...actual,
    AwardCard: ({ title }: { title: string }) => <h3 data-testid="AwardCardStub">{title}</h3>,
  };
});

import { ArrowUpRightIcon } from "@/app/_components/arrow-up-right-icon";
import { HeroSection } from "@/app/_components/hero-section";
import { AwardsSection } from "@/app/_components/awards-section";
import { SunKudosSection } from "@/app/_components/sun-kudos-section";
import { RootFurtherContent } from "@/app/_components/root-further-content";
import { HomeFooter } from "@/app/_components/home-footer";
import { HomeHeader } from "@/app/_components/home-header";

describe("Home presentational components", () => {
  it("ArrowUpRightIcon renders an SVG with the default size", () => {
    const { container } = render(<ArrowUpRightIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "24");
  });

  it("ArrowUpRightIcon respects the size prop", () => {
    const { container } = render(<ArrowUpRightIcon size={32} className="my-cls" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveClass("my-cls");
  });

  it("HeroSection renders the countdown + both CTA links", async () => {
    const ui = await HeroSection();
    render(ui);
    expect(screen.getByTestId("CountdownTimer")).toBeInTheDocument();
    expect(screen.getAllByTestId("LocalizedLink")).toHaveLength(2);
  });

  it("AwardsSection renders six AwardCard children", async () => {
    const ui = await AwardsSection();
    render(ui);
    expect(screen.getAllByTestId("AwardCardStub")).toHaveLength(6);
  });

  it("SunKudosSection renders the CTA link + headline", async () => {
    const ui = await SunKudosSection();
    render(ui);
    expect(screen.getByTestId("LocalizedLink")).toBeInTheDocument();
    expect(screen.getByText("home.kudos.heading")).toBeInTheDocument();
  });

  it("RootFurtherContent renders body paragraphs + quote", async () => {
    const ui = await RootFurtherContent();
    render(ui);
    expect(screen.getByText("home.root_further.para1")).toBeInTheDocument();
    expect(screen.getByText("home.root_further.quote")).toBeInTheDocument();
    expect(screen.getByText("home.root_further.para2")).toBeInTheDocument();
  });

  it("HomeFooter highlights the active nav link", async () => {
    const ui = await HomeFooter({ activePath: "/sun-kudos" });
    const { container } = render(ui);
    // Three nav links + one logo link
    expect(screen.getAllByTestId("LocalizedLink")).toHaveLength(4);
    // Active path passed through className differences (we look for the active className substring).
    expect(container.innerHTML).toContain("bg-[rgba(255,234,158,0.10)]");
  });

  it("HomeHeader renders nav, language switcher and user menu", async () => {
    const ui = await HomeHeader({ user: null, activePath: "/" });
    render(ui);
    expect(screen.getByTestId("LanguageSwitcher")).toBeInTheDocument();
    expect(screen.getByTestId("UserMenu")).toBeInTheDocument();
    expect(screen.getAllByTestId("LocalizedLink").length).toBeGreaterThanOrEqual(4);
  });

});
