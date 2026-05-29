import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";

import { MentionList, type MentionListHandle } from "@/app/sun-kudos/_components/mention-list";

const ITEMS = [
  { id: "1", name: "Alice", level: "Hero", badge: "B", avatar: null, department: null },
  { id: "2", name: "Bob", level: "Hero", badge: "B", avatar: null, department: null },
  { id: "3", name: "Charlie", level: "Hero", badge: "B", avatar: null, department: null },
];

describe("MentionList", () => {
  it("renders one option per item with @name + level", () => {
    render(<MentionList items={ITEMS} command={vi.fn()} />);
    expect(screen.getByText("@Alice")).toBeInTheDocument();
    expect(screen.getByText("@Bob")).toBeInTheDocument();
    expect(screen.getByText("@Charlie")).toBeInTheDocument();
  });

  it("renders a placeholder when items array is empty", () => {
    render(<MentionList items={[]} command={vi.fn()} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("calls command on click", () => {
    const command = vi.fn();
    render(<MentionList items={ITEMS} command={command} />);
    fireEvent.click(screen.getByText("@Bob"));
    expect(command).toHaveBeenCalledWith({ id: "2", label: "Bob" });
  });

  it("highlights the row on mouseEnter", () => {
    render(<MentionList items={ITEMS} command={vi.fn()} />);
    fireEvent.mouseEnter(screen.getByText("@Charlie"));
    // The highlighted row carries the bg-[#FFF8E1] class.
    const btn = screen.getByText("@Charlie").closest("button")!;
    expect(btn.className).toContain("bg-[#FFF8E1]");
  });

  it("ArrowDown / ArrowUp / Enter via imperative handle", () => {
    const command = vi.fn();
    const ref = createRef<MentionListHandle>();
    render(<MentionList ref={ref} items={ITEMS} command={command} />);

    expect(ref.current).toBeTruthy();
    // index starts at 0 → Enter picks Alice.
    act(() => {
      expect(
        ref.current!.onKeyDown({ event: { key: "Enter" } as KeyboardEvent }),
      ).toBe(true);
    });
    expect(command).toHaveBeenCalledWith({ id: "1", label: "Alice" });

    // ArrowDown twice → Charlie. Each setIndex must flush before the next
    // onKeyDown reads state, so wrap each call in act().
    act(() => {
      ref.current!.onKeyDown({ event: { key: "ArrowDown" } as KeyboardEvent });
    });
    act(() => {
      ref.current!.onKeyDown({ event: { key: "ArrowDown" } as KeyboardEvent });
    });
    act(() => {
      ref.current!.onKeyDown({ event: { key: "Enter" } as KeyboardEvent });
    });
    expect(command).toHaveBeenLastCalledWith({ id: "3", label: "Charlie" });

    // ArrowUp wraps from index 2 → index 1 (Bob).
    act(() => {
      ref.current!.onKeyDown({ event: { key: "ArrowUp" } as KeyboardEvent });
    });
    act(() => {
      ref.current!.onKeyDown({ event: { key: "Enter" } as KeyboardEvent });
    });
    expect(command).toHaveBeenLastCalledWith({ id: "2", label: "Bob" });
  });

  it("returns false from onKeyDown when items is empty", () => {
    const ref = createRef<MentionListHandle>();
    render(<MentionList ref={ref} items={[]} command={vi.fn()} />);
    expect(
      ref.current!.onKeyDown({ event: { key: "Enter" } as KeyboardEvent }),
    ).toBe(false);
  });

  it("returns false from onKeyDown for unhandled keys", () => {
    const ref = createRef<MentionListHandle>();
    render(<MentionList ref={ref} items={ITEMS} command={vi.fn()} />);
    expect(
      ref.current!.onKeyDown({ event: { key: "Tab" } as KeyboardEvent }),
    ).toBe(false);
  });
});
