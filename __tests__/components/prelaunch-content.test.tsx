import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const router = { refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));

// CountdownTimer is a complex client component — replace with a stub that
// exposes an onComplete trigger we can fire from the test.
vi.mock("@/app/_components/countdown-timer", () => ({
  CountdownTimer: ({ onComplete }: { onComplete?: () => void }) => (
    <button data-testid="trigger" type="button" onClick={() => onComplete?.()}>
      countdown
    </button>
  ),
}));

import { PrelaunchContent } from "@/app/prelaunch/_components/prelaunch-content";

describe("PrelaunchContent", () => {
  beforeEach(() => {
    router.refresh.mockReset();
    vi.useFakeTimers();
  });

  it("renders the countdown initially", () => {
    render(<PrelaunchContent />);
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
    expect(screen.queryByText(/common\.event_live/)).not.toBeInTheDocument();
  });

  it("swaps to the live message once the countdown completes", () => {
    render(<PrelaunchContent />);
    fireEvent.click(screen.getByTestId("trigger"));
    expect(screen.getByText(/common\.event_live/)).toBeInTheDocument();
    expect(screen.queryByTestId("trigger")).not.toBeInTheDocument();
  });

  it("refreshes the router 3s after completion", () => {
    render(<PrelaunchContent />);
    fireEvent.click(screen.getByTestId("trigger"));
    expect(router.refresh).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });
});
