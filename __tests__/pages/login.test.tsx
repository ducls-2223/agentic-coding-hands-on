import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../helpers/stub-component";
import { FAKE_LANG, fakeT } from "../helpers/mock-i18n";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn() }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/login/_components/login-header", () => ({ default: stub("LoginHeader") }));
vi.mock("@/app/login/_components/google-login-button", () => ({ default: stub("GoogleLoginButton") }));
vi.mock("@/app/login/_components/login-error-banner", () => ({ default: stub("LoginErrorBanner") }));
vi.mock("@/app/login/_components/root-further-wordmark", () => ({ default: stub("RootFurtherWordmark") }));
vi.mock("@/app/login/actions", () => ({ loginWithGoogle: vi.fn() }));

import LoginPage from "@/app/login/page";
import { getLanguage } from "@/lib/i18n/server";

const mockedGetLanguage = vi.mocked(getLanguage);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetLanguage.mockResolvedValue(FAKE_LANG);
  });

  it("renders core sections without an error banner when no ?error param", async () => {
    const ui = await LoginPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByTestId("LoginHeader")).toBeInTheDocument();
    expect(screen.getByTestId("RootFurtherWordmark")).toBeInTheDocument();
    expect(screen.getByTestId("GoogleLoginButton")).toBeInTheDocument();
    expect(screen.queryByTestId("LoginErrorBanner")).not.toBeInTheDocument();
  });

  it("renders the error banner when ?error=<code> is present", async () => {
    const ui = await LoginPage({
      searchParams: Promise.resolve({ error: "oauth_failed" }),
    });
    render(ui);

    const banner = screen.getByTestId("LoginErrorBanner");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute("data-prop-errorcode", "oauth_failed");
  });

  it("uses the resolved language for translations", async () => {
    await LoginPage({ searchParams: Promise.resolve({}) });
    expect(mockedGetLanguage).toHaveBeenCalledTimes(1);
  });
});
