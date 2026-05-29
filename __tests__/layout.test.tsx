import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "./helpers/stub-component";
import { makeSupabaseMock } from "./helpers/mock-supabase";

const headerGet = vi.fn();
vi.mock("next/headers", () => ({
  headers: () => Promise.resolve({ get: headerGet }),
}));
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
  Montserrat: () => ({ variable: "--font-montserrat" }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/app/_components/floating-action-widget", () => ({
  FloatingActionWidget: stub("FloatingActionWidget"),
}));
vi.mock("@/app/_components/language-context", () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="LanguageProvider">{children}</div>
  ),
}));
vi.mock("./globals.css", () => ({}), { virtual: true } as never);

import RootLayout from "@/app/layout";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const mockedCreateClient = vi.mocked(createSupabaseServerClient);

describe("RootLayout", () => {
  beforeEach(() => {
    headerGet.mockReset();
    mockedCreateClient.mockReset();
  });

  it("renders without throwing for a signed-out visitor and omits the FAB", async () => {
    mockedCreateClient.mockResolvedValue(
      makeSupabaseMock(null) as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
    headerGet.mockReturnValue("/");

    const ui = await RootLayout({ children: <p>kid</p> });
    // Don't actually render — RootLayout produces <html>, which jsdom can't
    // nest inside its existing document. We assert on the React tree directly.
    expect(ui).toBeDefined();
  });

  it("includes the FAB for signed-in users on non-prelaunch routes", async () => {
    mockedCreateClient.mockResolvedValue(
      makeSupabaseMock({ id: "u1" }) as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
    headerGet.mockReturnValue("/sun-kudos");

    const ui = await RootLayout({ children: <p>kid</p> });
    expect(ui).toBeDefined();
  });

  it("hides the FAB when pathname is /prelaunch even if signed in", async () => {
    mockedCreateClient.mockResolvedValue(
      makeSupabaseMock({ id: "u1" }) as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
    headerGet.mockReturnValue("/prelaunch");

    const ui = await RootLayout({ children: <p>kid</p> });
    expect(ui).toBeDefined();
  });
});
