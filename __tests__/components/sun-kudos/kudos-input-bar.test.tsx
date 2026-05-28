import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/sun-kudos/_actions/create-kudos", () => ({ createKudos: vi.fn() }));
vi.mock("@/app/sun-kudos/_components/kudos-write-dialog", () => ({
  KudosWriteDialog: ({ onSuccess, onClose }: { onSuccess?: () => void; onClose?: () => void }) => (
    <div data-testid="KudosWriteDialog">
      <button data-testid="dlg-success" onClick={() => onSuccess?.()}>ok</button>
      <button data-testid="dlg-close" onClick={() => onClose?.()}>x</button>
    </div>
  ),
}));

import { KudosInputBar } from "@/app/sun-kudos/_components/kudos-input-bar";

describe("KudosInputBar", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("opens the dialog when the input is clicked", () => {
    render(<KudosInputBar />);
    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.input_open" }));
    expect(screen.getByTestId("KudosWriteDialog")).toBeInTheDocument();
  });

  it("closes the dialog when onClose fires", () => {
    render(<KudosInputBar />);
    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.input_open" }));
    fireEvent.click(screen.getByTestId("dlg-close"));
    expect(screen.queryByTestId("KudosWriteDialog")).not.toBeInTheDocument();
  });

  it("shows toast + closes the dialog when onSuccess fires", () => {
    render(<KudosInputBar />);
    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.input_open" }));
    fireEvent.click(screen.getByTestId("dlg-success"));
    expect(screen.getByRole("status")).toHaveTextContent("fab.kudos_sent");
    expect(screen.queryByTestId("KudosWriteDialog")).not.toBeInTheDocument();
  });

  it("toast auto-dismisses after 2.5s", () => {
    render(<KudosInputBar />);
    fireEvent.click(screen.getByRole("button", { name: "sun_kudos.input_open" }));
    fireEvent.click(screen.getByTestId("dlg-success"));
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
