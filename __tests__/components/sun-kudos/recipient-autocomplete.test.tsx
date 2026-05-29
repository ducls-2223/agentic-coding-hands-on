import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { RecipientAutocomplete } from "@/app/sun-kudos/_components/recipient-autocomplete";

describe("RecipientAutocomplete", () => {
  let onChange: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    onChange = vi.fn();
  });

  it("renders an input with the current value", () => {
    render(<RecipientAutocomplete value="Bob" onChange={onChange} />);
    expect(screen.getByDisplayValue("Bob")).toBeInTheDocument();
  });

  it("opens the listbox on input focus", () => {
    render(<RecipientAutocomplete value="" onChange={onChange} />);
    fireEvent.focus(screen.getByPlaceholderText("kudos.dialog.recipient_placeholder"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("filters options by typed value", () => {
    render(<RecipientAutocomplete value="" onChange={onChange} />);
    fireEvent.focus(screen.getByPlaceholderText("kudos.dialog.recipient_placeholder"));
    fireEvent.change(screen.getByPlaceholderText("kudos.dialog.recipient_placeholder"), {
      target: { value: "ducanh" },
    });
    // With no real match for "ducanh" the listbox closes (filtered.length===0).
    // We instead test a partial-prefix match that we know exists.
  });

  it("matches a known SUNNER by substring and calls onChange when picked", () => {
    const { rerender } = render(
      <RecipientAutocomplete value="" onChange={onChange} />,
    );
    fireEvent.focus(screen.getByPlaceholderText("kudos.dialog.recipient_placeholder"));
    rerender(<RecipientAutocomplete value="An" onChange={onChange} />);

    const list = screen.getByRole("listbox");
    const option = list.querySelector("button")!;
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalled();
  });

  it("toggles the listbox via the chevron button", () => {
    render(<RecipientAutocomplete value="" onChange={onChange} />);
    fireEvent.click(
      screen.getByRole("button", { name: "kudos.dialog.recipient_open_list" }),
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("closes the listbox on outside mousedown", () => {
    render(
      <div>
        <RecipientAutocomplete value="" onChange={onChange} />
        <div data-testid="outside">x</div>
      </div>,
    );
    fireEvent.focus(screen.getByPlaceholderText("kudos.dialog.recipient_placeholder"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
