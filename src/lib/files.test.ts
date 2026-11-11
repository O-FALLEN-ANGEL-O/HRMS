import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ getDb: vi.fn(), schema: {} }));

const { sniff, fromBase64 } = await import("./files");

describe("uploaded file checks", () => {
  it("recognises real file types from their first bytes", () => {
    expect(sniff(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniff(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]))).toBe("image/png");
    expect(sniff(new TextEncoder().encode("%PDF-1.7"))).toBe("application/pdf");
    expect(sniff(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
  });

  it("rejects anything else, whatever its name says", () => {
    expect(sniff(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniff(new TextEncoder().encode("<html><script>"))).toBeNull();
    expect(sniff(new Uint8Array([]))).toBeNull();
  });

  it("decodes base64 back to the original bytes", () => {
    expect([...fromBase64(btoa("\x00\x01\xfe\xff"))]).toEqual([0, 1, 254, 255]);
  });
});
