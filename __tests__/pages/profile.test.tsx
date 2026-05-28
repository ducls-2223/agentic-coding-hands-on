import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { makeSupabaseMock } from "../helpers/mock-supabase";
import { stub } from "../helpers/stub-component";
import { FAKE_LANG, fakeT } from "../helpers/mock-i18n";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn() }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));
vi.mock("@/app/_components/localized-link", () => ({ LocalizedLink: stub("LocalizedLink") }));

import ProfilePage from "@/app/profile/page";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/i18n/server";

const mockedCreateClient = vi.mocked(createSupabaseServerClient);
const mockedGetLanguage = vi.mocked(getLanguage);

function setSupabase(user: Parameters<typeof makeSupabaseMock>[0]) {
  mockedCreateClient.mockResolvedValue(
    makeSupabaseMock(user) as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>,
  );
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetLanguage.mockResolvedValue(FAKE_LANG);
  });

  it("shows full_name when present in user_metadata", async () => {
    setSupabase({ id: "u1", email: "x@sun.com", user_metadata: { full_name: "Duc LS" } });
    const ui = await ProfilePage();
    render(ui);
    expect(screen.getByText("Duc LS")).toBeInTheDocument();
  });

  it("falls back to email when full_name missing", async () => {
    setSupabase({ id: "u1", email: "x@sun.com" });
    const ui = await ProfilePage();
    render(ui);
    expect(screen.getByText("x@sun.com")).toBeInTheDocument();
  });

  it("falls back to 'User' label when user is null", async () => {
    setSupabase(null);
    const ui = await ProfilePage();
    render(ui);
    expect(screen.getByText("User")).toBeInTheDocument();
  });
});
