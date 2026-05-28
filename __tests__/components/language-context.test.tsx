import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

const mockSearchParams = { get: vi.fn() };
vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

import { LanguageProvider, useLanguage } from "@/app/_components/language-context";

function Probe() {
  return <span data-testid="lang">{useLanguage()}</span>;
}

describe("LanguageProvider + useLanguage", () => {
  it("uses the URL ?lang= value when valid", () => {
    mockSearchParams.get.mockReturnValue("en");
    render(
      <LanguageProvider initial="vi">
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
  });

  it("falls back to the initial prop when no ?lang= is present", () => {
    mockSearchParams.get.mockReturnValue(null);
    render(
      <LanguageProvider initial="en">
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
  });

  it("falls back to the initial prop when ?lang= is an unknown value", () => {
    mockSearchParams.get.mockReturnValue("fr");
    render(
      <LanguageProvider initial="vi">
        <Probe />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("lang")).toHaveTextContent("vi");
  });
});
