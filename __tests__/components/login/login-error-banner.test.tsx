import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { fakeT } from "../../helpers/mock-i18n";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));

import LoginErrorBanner from "@/app/login/_components/login-error-banner";

describe("LoginErrorBanner", () => {
  it("renders an alert with the oauth_failed message for a known code", async () => {
    const ui = await LoginErrorBanner({ errorCode: "oauth_exchange_failed" });
    render(ui);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("login.error.oauth_failed");
  });

  it("falls back to the generic error key for an unknown code", async () => {
    const ui = await LoginErrorBanner({ errorCode: "totally_unknown" });
    render(ui);

    expect(screen.getByRole("alert")).toHaveTextContent("login.error.generic");
  });

  it("maps each known code to the right translation key", async () => {
    const cases: Array<[string, string]> = [
      ["oauth_init_failed", "login.error.generic"],
      ["oauth_exchange_failed", "login.error.oauth_failed"],
      ["oauth_missing_code", "login.error.generic"],
    ];

    for (const [code, expected] of cases) {
      const ui = await LoginErrorBanner({ errorCode: code });
      const { unmount } = render(ui);
      expect(screen.getByRole("alert")).toHaveTextContent(expected);
      unmount();
    }
  });
});
