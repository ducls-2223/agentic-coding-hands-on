import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { stub } from "../../helpers/stub-component";
import { fakeT } from "../../helpers/mock-i18n";

vi.mock("@/lib/i18n/server", () => ({ getLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/lib/i18n/t", () => ({ t: fakeT }));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import GoogleLoginButton from "@/app/login/_components/google-login-button";

describe("GoogleLoginButton", () => {
  it("renders the translation key as button label and wires the server action", async () => {
    const action = vi.fn();
    const ui = await GoogleLoginButton({ action });
    render(ui);

    expect(screen.getByRole("button", { name: /login\.google_button/ })).toBeInTheDocument();
    expect(screen.getByTestId("NextImage")).toBeInTheDocument();
  });
});
