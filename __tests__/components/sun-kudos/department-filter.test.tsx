import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../../helpers/stub-component";

vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { DepartmentFilter } from "@/app/sun-kudos/_components/department-filter";
import { DEPARTMENTS } from "@/app/sun-kudos/_data/departments";

describe("DepartmentFilter", () => {
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
  });

  it("renders the translation key when no department is picked", () => {
    render(<DepartmentFilter value={null} onChange={onChange} />);
    expect(screen.getByRole("button")).toHaveTextContent("sun_kudos.filter_department");
  });

  it("renders the department name when one is picked", () => {
    render(<DepartmentFilter value={DEPARTMENTS[0]} onChange={onChange} />);
    expect(screen.getByRole("button")).toHaveTextContent(DEPARTMENTS[0]);
  });

  it("opens the listbox and offers an 'all' option plus every department", () => {
    render(<DepartmentFilter value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(DEPARTMENTS.length + 1);
  });

  it("calls onChange with the picked department", () => {
    render(<DepartmentFilter value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(within(screen.getByRole("listbox")).getByText(DEPARTMENTS[0]));

    expect(onChange).toHaveBeenCalledWith(DEPARTMENTS[0]);
  });

  it("calls onChange with null when 'all' is picked", () => {
    render(<DepartmentFilter value={DEPARTMENTS[0]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(
      within(screen.getByRole("listbox")).getByText("sun_kudos.filter_department_all"),
    );

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("is a no-op when picking the same value", () => {
    render(<DepartmentFilter value={DEPARTMENTS[0]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(within(screen.getByRole("listbox")).getByText(DEPARTMENTS[0]));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes the listbox on outside mousedown", () => {
    render(
      <div>
        <DepartmentFilter value={null} onChange={onChange} />
        <div data-testid="outside">x</div>
      </div>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
