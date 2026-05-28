import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/_components/localized-link", () => ({ LocalizedLink: stub("LocalizedLink") }));
vi.mock("@/app/_components/language-switcher", () => ({ LanguageSwitcher: stub("LanguageSwitcher") }));

import LoginHeader from "@/app/login/_components/login-header";
import RootFurtherWordmark from "@/app/login/_components/root-further-wordmark";
import SaaLogo from "@/app/login/_components/saa-logo";

describe("Login presentational components", () => {
  it("LoginHeader composes the home link, logo, and language switcher", async () => {
    const ui = await LoginHeader();
    render(ui);
    expect(screen.getByTestId("LocalizedLink")).toHaveAttribute("data-prop-href", "/");
    expect(screen.getByTestId("LanguageSwitcher")).toBeInTheDocument();
  });

  it("RootFurtherWordmark renders the wordmark image", () => {
    render(<RootFurtherWordmark />);
    const img = screen.getByTestId("NextImage");
    expect(img).toHaveAttribute("data-prop-src", "/login/root-further.png");
  });

  it("SaaLogo forwards className and style props", () => {
    const { container } = render(<SaaLogo className="my-cls" style={{ opacity: 0.5 }} />);
    const img = container.querySelector('[data-testid="NextImage"]');
    expect(img).toHaveAttribute("data-prop-classname", "my-cls");
    expect(img).toHaveAttribute("data-prop-style", "object");
  });
});
