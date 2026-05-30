import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../../helpers/stub-component";

const searchSunnersMock = vi.fn();

vi.mock("@/app/sun-kudos/_actions/search-sunners", () => ({
  searchSunners: (...args: unknown[]) => searchSunnersMock(...args),
}));
vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { RecipientAutocomplete } from "@/app/sun-kudos/_components/recipient-autocomplete";
import type { Sunner } from "@/app/sun-kudos/_lib/fetch-sunners";

const TOP_THREE: Sunner[] = [
  { id: "00000000-0000-0000-0000-00000000000a", name: "Alice", level: "Hero", badge: "B", avatar: null, department: null },
  { id: "00000000-0000-0000-0000-00000000000b", name: "Bob", level: "Hero", badge: "B", avatar: null, department: null },
  { id: "00000000-0000-0000-0000-00000000000c", name: "Charlie", level: "Hero", badge: "B", avatar: null, department: null },
];

describe("RecipientAutocomplete (Supabase-backed)", () => {
  beforeEach(() => {
    searchSunnersMock.mockReset().mockResolvedValue(TOP_THREE);
  });


  it("renders the initialOptions in the listbox once the dropdown opens", async () => {
    const onChange = vi.fn();
    render(
      <RecipientAutocomplete
        value=""
        onChange={onChange}
        initialOptions={TOP_THREE}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "kudos.dialog.recipient_open_list" }),
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("calls searchSunners with the typed query (debounced)", async () => {
    const onChange = vi.fn();
    render(
      <RecipientAutocomplete
        value=""
        onChange={onChange}
        initialOptions={TOP_THREE}
      />,
    );
    fireEvent.change(
      screen.getByPlaceholderText("kudos.dialog.recipient_placeholder"),
      { target: { value: "Al" } },
    );
    await waitFor(() => {
      expect(searchSunnersMock).toHaveBeenCalledWith("Al");
    });
  });

  it("emits (id, label) via onChange when a row is picked", async () => {
    const onChange = vi.fn();
    render(
      <RecipientAutocomplete
        value=""
        onChange={onChange}
        initialOptions={TOP_THREE}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "kudos.dialog.recipient_open_list" }),
    );
    fireEvent.click(screen.getByText("Bob"));
    expect(onChange).toHaveBeenCalledWith(
      "00000000-0000-0000-0000-00000000000b",
      "Bob",
    );
  });

  it("clears the selection when the user keeps typing after a pick", async () => {
    const onChange = vi.fn();
    render(
      <RecipientAutocomplete
        value="00000000-0000-0000-0000-00000000000b"
        onChange={onChange}
        initialOptions={TOP_THREE}
      />,
    );
    fireEvent.change(
      screen.getByPlaceholderText("kudos.dialog.recipient_placeholder"),
      { target: { value: "Charl" } },
    );
    // The first onChange after typing must clear the previously-selected id.
    expect(onChange).toHaveBeenCalledWith("", "");
  });

  it("applies the error border + aria-invalid when hasError=true", () => {
    render(
      <RecipientAutocomplete
        value=""
        onChange={vi.fn()}
        initialOptions={TOP_THREE}
        hasError
      />,
    );
    const input = screen.getByPlaceholderText(
      "kudos.dialog.recipient_placeholder",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("closes the listbox on outside mousedown", () => {
    const onChange = vi.fn();
    const { container } = render(
      <div>
        <RecipientAutocomplete
          value=""
          onChange={onChange}
          initialOptions={TOP_THREE}
        />
        <div data-testid="outside">x</div>
      </div>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "kudos.dialog.recipient_open_list" }),
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    void container;
  });

  it("lazy-loads options on first focus when initialOptions is empty", async () => {
    const onChange = vi.fn();
    render(<RecipientAutocomplete value="" onChange={onChange} />);
    fireEvent.focus(
      screen.getByPlaceholderText("kudos.dialog.recipient_placeholder"),
    );
    await waitFor(() => {
      expect(searchSunnersMock).toHaveBeenCalled();
    });
  });
});
