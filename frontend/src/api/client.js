const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection.", 0);
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty body is fine */
  }

  if (!res.ok) {
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  }
  return data;
}

function qs(params) {
  const entries = Object.entries(params || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
}

export const api = {
  // Auth
  register: (payload) =>
    apiFetch("/api/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) =>
    apiFetch("/api/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => apiFetch("/api/auth/me"),

  // Mail
  listMail: (params) => apiFetch(`/api/mail${qs(params)}`),
  getCounts: (folder) => apiFetch(`/api/mail/counts${qs({ folder })}`),
  getMail: (id) => apiFetch(`/api/mail/${id}`),
  sendMail: (payload) => apiFetch("/api/mail", { method: "POST", body: payload }),
  patchMail: (id, payload) =>
    apiFetch(`/api/mail/${id}`, { method: "PATCH", body: payload }),
  deleteMail: (id, permanent = false) =>
    apiFetch(`/api/mail/${id}${permanent ? "?permanent=1" : ""}`, {
      method: "DELETE",
    }),
};
