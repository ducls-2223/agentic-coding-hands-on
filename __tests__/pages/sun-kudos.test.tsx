import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { makeSupabaseMock } from "../helpers/mock-supabase";
import { stub } from "../helpers/stub-component";
import { FAKE_LANG } from "../helpers/mock-i18n";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn() }));
vi.mock("@/app/sun-kudos/_lib/fetch-all-kudos", () => ({ fetchAllKudos: vi.fn() }));
vi.mock("@/app/_components/home-header", () => ({ HomeHeader: stub("HomeHeader") }));
vi.mock("@/app/_components/home-footer", () => ({ HomeFooter: stub("HomeFooter") }));
vi.mock("@/app/sun-kudos/_components/kudos-keyvisual", () => ({ KudosKeyvisual: stub("KudosKeyvisual") }));
vi.mock("@/app/sun-kudos/_components/kudos-input-bar", () => ({ KudosInputBar: stub("KudosInputBar") }));
vi.mock("@/app/sun-kudos/_components/highlight-section", () => ({ HighlightSection: stub("HighlightSection") }));
vi.mock("@/app/sun-kudos/_components/spotlight-board", () => ({ SpotlightBoard: stub("SpotlightBoard") }));
vi.mock("@/app/sun-kudos/_components/all-kudos-section", () => ({ AllKudosSection: stub("AllKudosSection") }));

import SunKudosPage from "@/app/sun-kudos/page";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/i18n/server";
import { fetchAllKudos } from "@/app/sun-kudos/_lib/fetch-all-kudos";

const mockedCreateClient = vi.mocked(createSupabaseServerClient);
const mockedGetLanguage = vi.mocked(getLanguage);
const mockedFetchAllKudos = vi.mocked(fetchAllKudos);

describe("SunKudosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetLanguage.mockResolvedValue(FAKE_LANG);
    mockedCreateClient.mockResolvedValue(
      makeSupabaseMock({ id: "u1", email: "x@sun.com" }) as unknown as Awaited<
        ReturnType<typeof createSupabaseServerClient>
      >,
    );
  });

  it("renders all sections and passes language to fetchAllKudos", async () => {
    mockedFetchAllKudos.mockResolvedValue([
      {
        id: "k1",
        sender: { name: "Alice", level: "Hero", badge: "/b.png", avatar: "/a.png" },
        receiver: { name: "Bob", level: "Hero", badge: "/b.png", avatar: "/b2.png" },
        message: "great work",
        hashtags: [],
        likes: 0,
        timestamp: "2026-05-28T00:00:00Z",
      },
    ]);

    const ui = await SunKudosPage();
    render(ui);

    expect(screen.getByTestId("HomeHeader")).toBeInTheDocument();
    expect(screen.getByTestId("KudosKeyvisual")).toBeInTheDocument();
    expect(screen.getByTestId("HighlightSection")).toBeInTheDocument();
    expect(screen.getByTestId("SpotlightBoard")).toBeInTheDocument();
    expect(screen.getByTestId("AllKudosSection")).toBeInTheDocument();
    expect(screen.getByTestId("HomeFooter")).toBeInTheDocument();
    expect(mockedFetchAllKudos).toHaveBeenCalledWith(FAKE_LANG);
  });

  it("still renders when fetchAllKudos returns an empty list", async () => {
    mockedFetchAllKudos.mockResolvedValue([]);

    const ui = await SunKudosPage();
    render(ui);

    expect(screen.getByTestId("AllKudosSection")).toBeInTheDocument();
    expect(mockedFetchAllKudos).toHaveBeenCalledWith(FAKE_LANG);
  });
});
