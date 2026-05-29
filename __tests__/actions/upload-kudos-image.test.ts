import { describe, it, expect, vi, beforeEach } from "vitest";

const getUser = vi.fn();
const upload = vi.fn();
const getPublicUrl = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser },
      storage: {
        from: vi.fn(() => ({ upload, getPublicUrl })),
      },
    }),
  ),
}));

import { uploadKudosImage } from "@/app/sun-kudos/_actions/upload-kudos-image";

function fileFormData(file: File): FormData {
  const fd = new FormData();
  fd.set("file", file);
  return fd;
}

describe("uploadKudosImage", () => {
  beforeEach(() => {
    getUser.mockReset().mockResolvedValue({
      data: { user: { id: "00000000-0000-0000-0000-000000000abc" } },
      error: null,
    });
    upload.mockReset().mockResolvedValue({ error: null });
    getPublicUrl
      .mockReset()
      .mockReturnValue({ data: { publicUrl: "https://supabase/storage/v1/object/public/kudos-images/x.jpg" } });
  });

  it("rejects non-File payloads", async () => {
    const fd = new FormData();
    fd.set("file", "not-a-file");
    const res = await uploadKudosImage(fd);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/không hợp lệ/i);
  });

  it("rejects unsupported mime types (e.g. PDF)", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "x.pdf", { type: "application/pdf" });
    const res = await uploadKudosImage(fileFormData(file));
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/JPG|PNG/i);
  });

  it("rejects files over 5MB", async () => {
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "x.jpg", { type: "image/jpeg" });
    const res = await uploadKudosImage(fileFormData(big));
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/5MB/);
  });

  it("rejects when user is unauthenticated", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const file = new File([new Uint8Array(100)], "x.jpg", { type: "image/jpeg" });
    const res = await uploadKudosImage(fileFormData(file));
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/đăng nhập/i);
  });

  it("uploads under <uid>/<uuid>.jpg and returns the public URL on success", async () => {
    const file = new File([new Uint8Array(100)], "x.jpg", { type: "image/jpeg" });
    const res = await uploadKudosImage(fileFormData(file));
    expect(res.ok).toBe(true);
    expect(res.url).toContain("/storage/v1/object/public/kudos-images/");
    expect(upload).toHaveBeenCalledTimes(1);
    const [path] = upload.mock.calls[0];
    expect(path).toMatch(/^00000000-0000-0000-0000-000000000abc\/[0-9a-f-]+\.jpg$/i);
  });

  it("accepts image/png and uses the .png extension", async () => {
    const file = new File([new Uint8Array(100)], "x.png", { type: "image/png" });
    const res = await uploadKudosImage(fileFormData(file));
    expect(res.ok).toBe(true);
    const [path] = upload.mock.calls[0];
    expect(path).toMatch(/\.png$/);
  });

  it("returns ok=false when Storage upload fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    upload.mockResolvedValueOnce({ error: { message: "boom" } });
    const file = new File([new Uint8Array(100)], "x.jpg", { type: "image/jpeg" });
    const res = await uploadKudosImage(fileFormData(file));
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
    errSpy.mockRestore();
  });
});
