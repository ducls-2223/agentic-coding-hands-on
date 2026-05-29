import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { makeSupabaseMock } from "../helpers/mock-supabase";
import { stub } from "../helpers/stub-component";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/app/_components/home-header", () => ({ HomeHeader: stub("HomeHeader") }));
vi.mock("@/app/_components/hero-section", () => ({ HeroSection: stub("HeroSection") }));
vi.mock("@/app/_components/root-further-content", () => ({ RootFurtherContent: stub("RootFurtherContent") }));
vi.mock("@/app/_components/awards-section", () => ({ AwardsSection: stub("AwardsSection") }));
vi.mock("@/app/_components/sun-kudos-section", () => ({ SunKudosSection: stub("SunKudosSection") }));
vi.mock("@/app/_components/home-footer", () => ({ HomeFooter: stub("HomeFooter") }));

import HomePage from "@/app/page";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const mockedCreateClient = vi.mocked(createSupabaseServerClient);

describe("HomePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all sections for a signed-out visitor", async () => {
    mockedCreateClient.mockResolvedValue(
      makeSupabaseMock(null) as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );

    const ui = await HomePage();
    render(ui);

    expect(screen.getByTestId("HomeHeader")).toBeInTheDocument();
    expect(screen.getByTestId("HeroSection")).toBeInTheDocument();
    expect(screen.getByTestId("RootFurtherContent")).toBeInTheDocument();
    expect(screen.getByTestId("AwardsSection")).toBeInTheDocument();
    expect(screen.getByTestId("SunKudosSection")).toBeInTheDocument();
    expect(screen.getByTestId("HomeFooter")).toBeInTheDocument();
  });

  it("passes the authenticated user object to HomeHeader", async () => {
    const fakeUser = { id: "u1", email: "ducls@sun-asterisk.com" };
    mockedCreateClient.mockResolvedValue(
      makeSupabaseMock(fakeUser) as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );

    const ui = await HomePage();
    render(ui);

    expect(screen.getByTestId("HomeHeader")).toHaveAttribute("data-prop-user", "object");
  });
});
