import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { AwardsMenu } from "@/app/awards-information/_components/awards-menu";

const ITEMS = [
  { slug: "mvp", title: "MVP" },
  { slug: "top-talent", title: "Top Talent" },
];

let lastObserverCallback:
  | ((entries: IntersectionObserverEntry[]) => void)
  | null = null;

describe("AwardsMenu", () => {
  beforeEach(() => {
    // Reset the URL hash so the state initializer doesn't leak between tests.
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", window.location.pathname);
    }
    document.body.innerHTML = "";
    for (const item of ITEMS) {
      const section = document.createElement("section");
      section.id = item.slug;
      section.scrollIntoView = vi.fn();
      document.body.appendChild(section);
    }
    lastObserverCallback = null;
    (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver = class {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        lastObserverCallback = cb;
      }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = "";
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
  });

  it("highlights the first item by default", () => {
    render(<AwardsMenu items={ITEMS} />);
    const mvpLink = screen.getByText("MVP").closest("a")!;
    expect(mvpLink).toHaveAttribute("aria-current", "true");
  });

  it("scrolls to the picked item and updates aria-current on click", () => {
    render(<AwardsMenu items={ITEMS} />);
    const link = screen.getByText("Top Talent").closest("a")!;

    const target = document.getElementById("top-talent")!;
    const scrollSpy = target.scrollIntoView as unknown as ReturnType<typeof vi.fn>;

    fireEvent.click(link);

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(link).toHaveAttribute("aria-current", "true");
  });

  it("renders nothing problematic for an empty list", () => {
    const { container } = render(<AwardsMenu items={[]} />);
    expect(container.querySelector("nav")).toBeInTheDocument();
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });

  it("updates active slug when the IntersectionObserver reports a visible entry", () => {
    render(<AwardsMenu items={ITEMS} />);
    expect(lastObserverCallback).toBeTruthy();

    act(() => {
      lastObserverCallback!([
        {
          isIntersecting: true,
          intersectionRatio: 0.8,
          target: document.getElementById("top-talent"),
        },
        {
          isIntersecting: true,
          intersectionRatio: 0.3,
          target: document.getElementById("mvp"),
        },
      ] as unknown as IntersectionObserverEntry[]);
    });

    expect(screen.getByText("Top Talent").closest("a")).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("ignores observer updates with no intersecting entries", () => {
    render(<AwardsMenu items={ITEMS} />);
    act(() => {
      lastObserverCallback!([
        {
          isIntersecting: false,
          intersectionRatio: 0,
          target: document.getElementById("top-talent"),
        },
      ] as unknown as IntersectionObserverEntry[]);
    });
    expect(screen.getByText("MVP").closest("a")).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("ignores observer updates during programmatic scroll", () => {
    render(<AwardsMenu items={ITEMS} />);
    fireEvent.click(screen.getByText("Top Talent").closest("a")!);

    act(() => {
      lastObserverCallback!([
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target: document.getElementById("mvp"),
        },
      ] as unknown as IntersectionObserverEntry[]);
    });

    expect(screen.getByText("Top Talent").closest("a")).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("does not throw when click target doesn't exist in DOM", () => {
    render(<AwardsMenu items={[{ slug: "ghost", title: "Ghost" }]} />);
    const link = screen.getByText("Ghost").closest("a")!;
    expect(() => fireEvent.click(link)).not.toThrow();
  });
});
