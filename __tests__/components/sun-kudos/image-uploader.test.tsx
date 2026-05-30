import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { stub } from "../../helpers/stub-component";

const uploadMock = vi.fn();

vi.mock("@/app/sun-kudos/_actions/upload-kudos-image", () => ({
  uploadKudosImage: (...args: unknown[]) => uploadMock(...args),
}));
vi.mock("@/app/_components/use-translation", () => ({
  useTranslation: () => ({ t: (k: string) => k, lang: "en" }),
}));
vi.mock("next/image", () => ({ default: stub("NextImage") }));

import { ImageUploader } from "@/app/sun-kudos/_components/image-uploader";

function makeFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe("ImageUploader", () => {
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
    uploadMock.mockReset();
  });

  it("renders an empty state with the + Image button", () => {
    render(<ImageUploader value={[]} onChange={onChange} />);
    expect(screen.getByText("kudos.dialog.image_button")).toBeInTheDocument();
  });

  it("renders thumbnails for each url in value", () => {
    render(
      <ImageUploader
        value={["https://example.com/a.jpg", "https://example.com/b.jpg"]}
        onChange={onChange}
      />,
    );
    // 2 thumbnails (NextImage stubs) + 1 plus-icon image inside the button = 3
    expect(screen.getAllByTestId("NextImage").length).toBeGreaterThanOrEqual(2);
  });

  it("hides the + Image button at the max", () => {
    render(
      <ImageUploader
        value={["a", "b", "c", "d", "e"]}
        onChange={onChange}
      />,
    );
    expect(screen.queryByText("kudos.dialog.image_button")).not.toBeInTheDocument();
  });

  it("removes a thumbnail when its X is clicked", () => {
    render(
      <ImageUploader
        value={["https://example.com/a.jpg", "https://example.com/b.jpg"]}
        onChange={onChange}
      />,
    );
    const buttons = screen.getAllByRole("button", { name: /image_remove/i });
    fireEvent.click(buttons[0]);
    expect(onChange).toHaveBeenCalledWith(["https://example.com/b.jpg"]);
  });

  it("uploads a picked JPEG and emits the new URL", async () => {
    uploadMock.mockResolvedValueOnce({ ok: true, url: "https://supabase/x.jpg" });
    const { container } = render(<ImageUploader value={[]} onChange={onChange} />);

    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("a.jpg", "image/jpeg", 100);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(["https://supabase/x.jpg"]),
    );
  });

  it("surfaces invalid file-type error inline", async () => {
    const { container } = render(<ImageUploader value={[]} onChange={onChange} />);
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("x.pdf", "application/pdf", 100);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByText("kudos.dialog.image_invalid_type")).toBeInTheDocument(),
    );
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("surfaces oversize error inline (> 5MB)", async () => {
    const { container } = render(<ImageUploader value={[]} onChange={onChange} />);
    const input = container.querySelector('input[type="file"]')!;
    const file = makeFile("big.jpg", "image/jpeg", 6 * 1024 * 1024);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByText("kudos.dialog.image_too_large")).toBeInTheDocument(),
    );
  });

  it("surfaces upload-failed error from the server action", async () => {
    uploadMock.mockResolvedValueOnce({ ok: false, error: "Could not upload." });
    const { container } = render(<ImageUploader value={[]} onChange={onChange} />);
    const input = container.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [makeFile("a.jpg", "image/jpeg", 100)] } });
    await waitFor(() =>
      expect(screen.getByText("Could not upload.")).toBeInTheDocument(),
    );
  });
});
