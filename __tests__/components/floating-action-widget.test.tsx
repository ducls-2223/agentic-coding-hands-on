import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { stub } from "../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/sun-kudos/_actions/create-kudos", () => ({ createKudos: vi.fn() }));
vi.mock("@/app/sun-kudos/_components/kudos-write-dialog", () => ({
  KudosWriteDialog: ({ onSuccess, onClose }: { onSuccess?: () => void; onClose?: () => void }) => (
    <div data-testid="KudosWriteDialog">
      <button data-testid="dialog-success" onClick={() => onSuccess?.()}>success</button>
      <button data-testid="dialog-close" onClick={() => onClose?.()}>close</button>
    </div>
  ),
}));
vi.mock("@/app/_components/rules-modal", () => ({
  RulesModal: ({ onClose, onWriteKudos }: { onClose?: () => void; onWriteKudos?: () => void }) => (
    <div data-testid="RulesModal">
      <button data-testid="rules-write" onClick={() => onWriteKudos?.()}>write</button>
      <button data-testid="rules-close" onClick={() => onClose?.()}>close</button>
    </div>
  ),
}));

import { FloatingActionWidget } from "@/app/_components/floating-action-widget";

describe("FloatingActionWidget", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts collapsed and expands on click", () => {
    render(<FloatingActionWidget />);
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("fab.rules")).toBeInTheDocument();
    expect(screen.getByText("fab.write_kudos")).toBeInTheDocument();
  });

  it("opens the rules modal when 'Rules' is clicked", () => {
    render(<FloatingActionWidget />);
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    fireEvent.click(screen.getByText("fab.rules"));
    expect(screen.getByTestId("RulesModal")).toBeInTheDocument();
  });

  it("opens the write-kudos dialog when 'Write Kudos' is clicked", () => {
    render(<FloatingActionWidget />);
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    fireEvent.click(screen.getByText("fab.write_kudos"));
    expect(screen.getByTestId("KudosWriteDialog")).toBeInTheDocument();
  });

  it("Escape collapses an expanded menu", () => {
    render(<FloatingActionWidget />);
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("Escape closes the rules modal", () => {
    render(<FloatingActionWidget />);
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    fireEvent.click(screen.getByText("fab.rules"));
    expect(screen.getByTestId("RulesModal")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("RulesModal")).not.toBeInTheDocument();
  });


  it("Rules modal -> Write Kudos transitions to the dialog mode", () => {
    render(<FloatingActionWidget />);
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    fireEvent.click(screen.getByText("fab.rules"));
    fireEvent.click(screen.getByTestId("rules-write"));
    expect(screen.getByTestId("KudosWriteDialog")).toBeInTheDocument();
    expect(screen.queryByTestId("RulesModal")).not.toBeInTheDocument();
  });

  it("Dialog onClose collapses without firing the toast", () => {
    render(<FloatingActionWidget />);
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    fireEvent.click(screen.getByText("fab.write_kudos"));
    fireEvent.click(screen.getByTestId("dialog-close"));
    expect(screen.queryByTestId("KudosWriteDialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("dialog-success triggers the toast and collapses", () => {
    render(<FloatingActionWidget />);
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    fireEvent.click(screen.getByText("fab.write_kudos"));
    fireEvent.click(screen.getByTestId("dialog-success"));
    expect(screen.getByRole("status")).toHaveTextContent("fab.kudos_sent");
    expect(screen.queryByTestId("KudosWriteDialog")).not.toBeInTheDocument();
  });

  it("toast auto-dismisses after 2.5s", () => {
    render(<FloatingActionWidget />);
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    fireEvent.click(screen.getByText("fab.write_kudos"));
    fireEvent.click(screen.getByTestId("dialog-success"));
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("collapses on outside mousedown", () => {
    render(
      <div>
        <FloatingActionWidget />
        <div data-testid="outside">x</div>
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "fab.open_menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
