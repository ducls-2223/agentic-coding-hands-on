import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { stub } from "../helpers/stub-component";

const resolveEventStartMs = vi.fn();
vi.mock("@/lib/event-time", () => ({
  resolveEventStartMs: () => resolveEventStartMs(),
}));
vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { CountdownTimer } from "@/app/_components/countdown-timer";

describe("CountdownTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    resolveEventStartMs.mockReset();
  });

  it("renders the skeleton on initial sync render", () => {
    resolveEventStartMs.mockReturnValue(Date.now() + 60_000 * 60 * 24 * 30);
    const { container } = render(<CountdownTimer />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders day/hour/minute units after the microtask resolves", async () => {
    resolveEventStartMs.mockReturnValue(Date.now() + 60_000 * 60 * 25);
    render(<CountdownTimer title="Coming soon" />);

    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText("countdown.days")).toBeInTheDocument();
    expect(screen.getByText("countdown.hours")).toBeInTheDocument();
    expect(screen.getByText("countdown.minutes")).toBeInTheDocument();
  });

  it("fires onComplete once when target is in the past", async () => {
    resolveEventStartMs.mockReturnValue(Date.now() - 1000);
    const onComplete = vi.fn();
    render(<CountdownTimer onComplete={onComplete} />);

    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not call onComplete more than once across ticks", async () => {
    resolveEventStartMs.mockReturnValue(Date.now() - 1000);
    const onComplete = vi.fn();
    render(<CountdownTimer onComplete={onComplete} />);

    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(60_000);
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("uses the default title key when no title prop is given", async () => {
    resolveEventStartMs.mockReturnValue(Date.now() + 60_000 * 30);
    render(<CountdownTimer />);

    await act(async () => {
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("countdown.coming_soon")).toBeInTheDocument();
  });
});
