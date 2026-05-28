import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../helpers/stub-component";
import { fakeT } from "../helpers/mock-i18n";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/_components/localized-link", () => ({ LocalizedLink: stub("LocalizedLink") }));

import { AwardCard } from "@/app/_components/award-card";

describe("AwardCard", () => {
  it("renders title, description, and a details link with the slug anchor", async () => {
    const ui = await AwardCard({
      slug: "mvp",
      title: "MVP",
      desc: "Most Valuable Person",
      image: "/x.png",
    });
    render(ui);

    expect(screen.getByRole("heading", { name: "MVP" })).toBeInTheDocument();
    expect(screen.getByText("Most Valuable Person")).toBeInTheDocument();
    expect(screen.getByTestId("LocalizedLink")).toHaveAttribute(
      "data-prop-href",
      "/awards-information#mvp",
    );
  });
});
