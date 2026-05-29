import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../helpers/stub-component";

vi.mock("next/image", () => ({ default: stub("NextImage") }));
vi.mock("@/app/prelaunch/_components/prelaunch-content", () => ({
  PrelaunchContent: stub("PrelaunchContent"),
}));

import PrelaunchPage from "@/app/prelaunch/page";

describe("PrelaunchPage", () => {
  it("renders the background image and PrelaunchContent", () => {
    render(<PrelaunchPage />);
    expect(screen.getByTestId("NextImage")).toBeInTheDocument();
    expect(screen.getByTestId("PrelaunchContent")).toBeInTheDocument();
  });
});
