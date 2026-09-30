import { afterEach, expect, it, vi } from "vitest";
import { api, ApiError, setCsrfToken } from "./client";
afterEach(() => vi.unstubAllGlobals());
it("sends the session-bound CSRF value only on mutations", async () => {
  const mock = vi
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ok: true } }),
    });
  vi.stubGlobal("fetch", mock);
  setCsrfToken("csrf-test");
  await api("/api/me/settings", { method: "PATCH", body: "{}" });
  expect(mock.mock.calls[0][1].headers["X-CSRF-Token"]).toBe("csrf-test");
  expect(mock.mock.calls[0][1].credentials).toBe("same-origin");
  await api("/api/session");
  expect(mock.mock.calls[1][1].headers["X-CSRF-Token"]).toBeUndefined();
});
it("keeps expired business authorization separate from login expiry", async () => {
  const handler = vi.fn();
  window.addEventListener("session-expired", handler);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          error: { code: "AUTHORIZATION_REQUIRED", message: "授权已过期" },
        }),
      }),
  );
  await expect(api("/api/me/runs", { method: "POST" })).rejects.toBeInstanceOf(
    ApiError,
  );
  expect(handler).not.toHaveBeenCalled();
  window.removeEventListener("session-expired", handler);
});
