import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { RulesModal } from "@/app/_components/rules-modal";

describe("RulesModal", () => {
  it("renders the three sections with their headings", () => {
    render(<RulesModal onClose={vi.fn()} onWriteKudos={vi.fn()} />);
    expect(screen.getByText("rules.receivers.heading")).toBeInTheDocument();
    expect(screen.getByText("rules.senders.heading")).toBeInTheDocument();
    expect(screen.getByText("rules.national.heading")).toBeInTheDocument();
  });

  it("renders the 4 hero tier badges and 6 secret-box badges", () => {
    render(<RulesModal onClose={vi.fn()} onWriteKudos={vi.fn()} />);
    expect(screen.getAllByTestId("NextImage").length).toBeGreaterThanOrEqual(4 + 6 + 2);
  });

  it("calls onClose when clicking the backdrop", () => {
    const onClose = vi.fn();
    const { container } = render(<RulesModal onClose={onClose} onWriteKudos={vi.fn()} />);
    fireEvent.click(container.querySelector(".bg-black\\/70")!);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking the Đóng button", () => {
    const onClose = vi.fn();
    render(<RulesModal onClose={onClose} onWriteKudos={vi.fn()} />);
    fireEvent.click(screen.getByText("common.close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onWriteKudos when clicking the Viết KUDOS button", () => {
    const onWriteKudos = vi.fn();
    render(<RulesModal onClose={vi.fn()} onWriteKudos={onWriteKudos} />);
    fireEvent.click(screen.getByText("fab.write_kudos"));
    expect(onWriteKudos).toHaveBeenCalled();
  });

  it("locks body scroll on mount and restores it on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(<RulesModal onClose={vi.fn()} onWriteKudos={vi.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});
