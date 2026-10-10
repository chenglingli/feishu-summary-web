// Session and CSRF stay in memory; Feishu credentials are never sent to this application.
let csrfToken = "";
export function setCsrfToken(value: string) {
  csrfToken = value;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId?: string,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method ?? "GET";
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(!["GET", "HEAD"].includes(method)
        ? { "X-CSRF-Token": csrfToken }
        : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      setCsrfToken("");
      window.dispatchEvent(new Event("session-expired"));
    }
    throw new ApiError(
      response.status,
      payload.error?.code ?? "NETWORK_ERROR",
      payload.error?.message ?? "请求失败，请稍后重试",
      payload.request_id,
    );
  }
  return payload.data as T;
}
