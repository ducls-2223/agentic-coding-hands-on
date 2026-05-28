import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

const mockLang = { current: "en" as "vi" | "en" };
vi.mock("@/app/_components/language-context", () => ({
  useLanguage: () => mockLang.current,
}));

import { useTranslation } from "@/app/_components/use-translation";

function Probe() {
  const { t, lang } = useTranslation();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="profile">{t("nav.profile")}</span>
    </div>
  );
}

describe("useTranslation", () => {
  it("returns the active language from context", () => {
    mockLang.current = "en";
    render(<Probe />);
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
  });

  it("translates keys via the real dictionary in English", () => {
    mockLang.current = "en";
    render(<Probe />);
    expect(screen.getByTestId("profile")).toHaveTextContent("Profile");
  });

  it("translates keys via the real dictionary in Vietnamese", () => {
    mockLang.current = "vi";
    render(<Probe />);
    expect(screen.getByTestId("profile")).toHaveTextContent("Hồ sơ");
  });
});
