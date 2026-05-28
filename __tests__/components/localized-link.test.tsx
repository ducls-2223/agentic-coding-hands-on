import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { Language } from "@/lib/i18n";

const mockLang = { current: "vi" as Language };
vi.mock("@/app/_components/language-context", () => ({
  useLanguage: () => mockLang.current,
}));
// Render next/link as a plain <a> so we can introspect href.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

import { LocalizedLink } from "@/app/_components/localized-link";

function getHref(text: string) {
  return screen.getByText(text).closest("a")!.getAttribute("href");
}

describe("LocalizedLink", () => {
  it("passes internal href unchanged when language is the default (vi)", () => {
    mockLang.current = "vi";
    render(<LocalizedLink href="/profile">go</LocalizedLink>);
    expect(getHref("go")).toBe("/profile");
  });

  it("appends ?lang=en to bare internal href when language is non-default", () => {
    mockLang.current = "en";
    render(<LocalizedLink href="/profile">go</LocalizedLink>);
    expect(getHref("go")).toBe("/profile?lang=en");
  });

  it("appends &lang=en when href already has a query string", () => {
    mockLang.current = "en";
    render(<LocalizedLink href="/sun-kudos?dept=ENG">go</LocalizedLink>);
    expect(getHref("go")).toBe("/sun-kudos?dept=ENG&lang=en");
  });

  it("preserves a hash fragment when appending lang", () => {
    mockLang.current = "en";
    render(<LocalizedLink href="/profile#section">go</LocalizedLink>);
    expect(getHref("go")).toBe("/profile?lang=en#section");
  });

  it("does not duplicate lang= when caller already set it", () => {
    mockLang.current = "en";
    render(<LocalizedLink href="/profile?lang=vi">go</LocalizedLink>);
    expect(getHref("go")).toBe("/profile?lang=vi");
  });

  it("leaves external URLs unchanged", () => {
    mockLang.current = "en";
    render(<LocalizedLink href="https://example.com/x">go</LocalizedLink>);
    expect(getHref("go")).toBe("https://example.com/x");
  });

  it("leaves anchor-only hrefs unchanged", () => {
    mockLang.current = "en";
    render(<LocalizedLink href="#top">go</LocalizedLink>);
    expect(getHref("go")).toBe("#top");
  });
});
