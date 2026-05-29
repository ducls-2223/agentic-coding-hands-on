import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../helpers/stub-component";

const router = { push: vi.fn(), refresh: vi.fn() };
const pathname = "/sun-kudos";
const searchParamsState = { current: new URLSearchParams() };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => pathname,
  useSearchParams: () => searchParamsState.current,
}));
vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "vi" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { LanguageSwitcher } from "@/app/_components/language-switcher";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    router.push.mockReset();
    router.refresh.mockReset();
    searchParamsState.current = new URLSearchParams();
  });

  it("renders the current language label and is closed by default", () => {
    render(<LanguageSwitcher current="vi" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("VN");
  });

  it("opens the listbox on trigger click", () => {
    render(<LanguageSwitcher current="vi" />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("navigates with ?lang=en when picking English", () => {
    render(<LanguageSwitcher current="vi" />);
    fireEvent.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByText("EN"));

    expect(router.push).toHaveBeenCalledWith("/sun-kudos?lang=en");
    expect(router.refresh).toHaveBeenCalled();
  });

  it("removes the ?lang= param when picking the default language", () => {
    searchParamsState.current = new URLSearchParams({ lang: "en" });
    render(<LanguageSwitcher current="en" />);
    fireEvent.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByText("VN"));

    expect(router.push).toHaveBeenCalledWith("/sun-kudos");
  });

  it("closes the listbox on outside mousedown", () => {
    render(
      <div>
        <LanguageSwitcher current="vi" />
        <div data-testid="outside">x</div>
      </div>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("syncs selected when the current prop changes externally", () => {
    const { rerender } = render(<LanguageSwitcher current="vi" />);
    expect(screen.getByRole("button")).toHaveTextContent("VN");
    rerender(<LanguageSwitcher current="en" />);
    expect(screen.getByRole("button")).toHaveTextContent("EN");
  });

  it("is a no-op when picking the language already selected", () => {
    render(<LanguageSwitcher current="vi" />);
    fireEvent.click(screen.getByRole("button"));
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByText("VN"));

    expect(router.push).not.toHaveBeenCalled();
    expect(router.refresh).not.toHaveBeenCalled();
  });
});
