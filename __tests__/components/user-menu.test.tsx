import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../helpers/stub-component";

const mockTranslate = vi.fn((key: string) => key);
vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: mockTranslate, lang: "en" }),
}));
vi.mock("@/app/_components/localized-link", () => ({ LocalizedLink: stub("LocalizedLink") }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { UserMenu } from "@/app/_components/user-menu";

const signOutAction = vi.fn();

describe("UserMenu", () => {
  beforeEach(() => {
    signOutAction.mockReset();
    mockTranslate.mockClear();
  });

  it("renders the closed trigger with aria-expanded=false", () => {
    render(<UserMenu user={null} signOutAction={signOutAction} />);
    const trigger = screen.getByRole("button", { name: "nav.profile" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(screen.queryByText("nav.sign_out")).not.toBeInTheDocument();
  });

  it("opens the dropdown when the trigger is clicked", () => {
    render(<UserMenu user={null} signOutAction={signOutAction} />);
    const trigger = screen.getByRole("button", { name: "nav.profile" });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    expect(screen.getByText("nav.sign_out")).toBeInTheDocument();
    // The link inside the panel (mocked as LocalizedLink stub) is present.
    expect(screen.getByTestId("LocalizedLink")).toBeInTheDocument();
  });


  // Escape-to-close lives in the post-MoMorph user-menu redesign that is on
  // a sibling branch; skipped here until that change lands.
  it.skip("closes the dropdown when Escape is pressed", () => {
    render(<UserMenu user={null} signOutAction={signOutAction} />);
    const trigger = screen.getByRole("button", { name: "nav.profile" });
    fireEvent.click(trigger);
    expect(screen.getByText("nav.sign_out")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("nav.sign_out")).not.toBeInTheDocument();
  });

  it("closes the dropdown on outside mousedown", () => {
    render(
      <div>
        <UserMenu user={null} signOutAction={signOutAction} />
        <div data-testid="outside">click me</div>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "nav.profile" }));
    expect(screen.getByText("nav.sign_out")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByText("nav.sign_out")).not.toBeInTheDocument();
  });

  it("shows the avatar image when user has avatar_url metadata", () => {
    const user = { user_metadata: { avatar_url: "/a.png", full_name: "Duc" } };
    render(
      <UserMenu
        user={user as unknown as Parameters<typeof UserMenu>[0]["user"]}
        signOutAction={signOutAction}
      />,
    );
    const images = screen.getAllByTestId("NextImage");
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute("data-prop-src", "/a.png");
  });
});
