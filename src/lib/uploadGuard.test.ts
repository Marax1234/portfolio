import { beforeEach, describe, expect, it, vi } from "vitest";

// Payload wird nicht gebootet: getPayload liefert nur ein auth(), dessen Ergebnis der Test setzt.
const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ auth })) }));

import { guardLargeAnonymousMultipart } from "./uploadGuard";

const MiB = 1024 * 1024;

function request(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/media", { method: "POST", headers });
}

describe("guardLargeAnonymousMultipart (B25 Session 8)", () => {
  const handler = vi.fn(async () => new Response("ok"));
  const guarded = guardLargeAnonymousMultipart(handler);

  beforeEach(() => {
    handler.mockClear();
    auth.mockReset();
  });

  it("lässt Nicht-Multipart-Requests ohne Anmeldeprüfung durch", async () => {
    await guarded(request({ "content-type": "application/json", "content-length": String(10 * MiB) }));
    expect(handler).toHaveBeenCalledOnce();
    expect(auth).not.toHaveBeenCalled();
  });

  it("lässt kleine Multipart-Formulare anonym durch (Admin-Login)", async () => {
    await guarded(request({ "content-type": "multipart/form-data; boundary=x", "content-length": String(MiB) }));
    expect(handler).toHaveBeenCalledOnce();
    expect(auth).not.toHaveBeenCalled();
  });

  it("lehnt große anonyme Uploads mit 403 ab, ohne den Handler aufzurufen", async () => {
    auth.mockResolvedValue({ user: null });
    const res = await guarded(
      request({ "content-type": "Multipart/Form-Data; boundary=x", "content-length": String(MiB + 1) }),
    );
    expect(res.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it("behandelt Uploads ohne Content-Length (chunked) wie große", async () => {
    auth.mockResolvedValue({ user: null });
    const res = await guarded(request({ "content-type": "multipart/form-data; boundary=x" }));
    expect(res.status).toBe(403);
    expect(handler).not.toHaveBeenCalled();
  });

  it("lässt große Uploads angemeldeter Nutzer durch", async () => {
    auth.mockResolvedValue({ user: { id: 1 } });
    const res = await guarded(
      request({ "content-type": "multipart/form-data; boundary=x", "content-length": String(500 * MiB) }),
    );
    expect(await res.text()).toBe("ok");
    expect(handler).toHaveBeenCalledOnce();
  });
});
