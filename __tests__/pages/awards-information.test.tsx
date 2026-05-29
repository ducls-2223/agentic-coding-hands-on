import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { makeSupabaseMock } from "../helpers/mock-supabase";
import { stub } from "../helpers/stub-component";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/app/_components/home-header", () => ({ HomeHeader: stub("HomeHeader") }));
vi.mock("@/app/_components/home-footer", () => ({ HomeFooter: stub("HomeFooter") }));
vi.mock("@/app/awards-information/_components/awards-keyvisual", () => ({ AwardsKeyvisual: stub("AwardsKeyvisual") }));
vi.mock("@/app/awards-information/_components/awards-title", () => ({ AwardsTitle: stub("AwardsTitle") }));
vi.mock("@/app/awards-information/_components/awards-layout", () => ({ AwardsLayout: stub("AwardsLayout") }));
vi.mock("@/app/awards-information/_components/awards-menu", () => ({ AwardsMenu: stub("AwardsMenu") }));
vi.mock("@/app/awards-information/_components/award-detail", () => ({ AwardDetail: stub("AwardDetail") }));
vi.mock("@/app/awards-information/_components/awards-kudos-banner", () => ({ AwardsKudosBanner: stub("AwardsKudosBanner") }));

import AwardsInformationPage from "@/app/awards-information/page";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const mockedCreateClient = vi.mocked(createSupabaseServerClient);

describe("AwardsInformationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCreateClient.mockResolvedValue(
      makeSupabaseMock({ id: "u1" }) as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
  });

  it("renders the header, banner and structural sections", async () => {
    const ui = await AwardsInformationPage();
    render(ui);

    expect(screen.getByTestId("HomeHeader")).toBeInTheDocument();
    expect(screen.getByTestId("AwardsKeyvisual")).toBeInTheDocument();
    expect(screen.getByTestId("AwardsLayout")).toBeInTheDocument();
    expect(screen.getByTestId("AwardsKudosBanner")).toBeInTheDocument();
    expect(screen.getByTestId("HomeFooter")).toBeInTheDocument();
  });

  it("renders one AwardDetail per award in the static list (6 total)", async () => {
    const ui = await AwardsInformationPage();
    render(ui);

    expect(screen.getAllByTestId("AwardDetail")).toHaveLength(6);
  });
});
