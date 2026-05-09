export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://wellness.alwaysdata.net";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

let refreshPromise = null;

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem("token");
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function persistAuth({ token, access_token, refresh_token, user }) {
  const accessToken = access_token || token;
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem("token", accessToken);
  }
  if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (user.school_id) localStorage.setItem("school_id", user.school_id);
    else localStorage.removeItem("school_id");
  }
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("school_id");
}

export async function loginRequest(email, password) {
  const response = await fetch(`${API_BASE_URL}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Login failed");
  }
  persistAuth(data);
  return data;
}

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuth();
    throw new Error("Missing refresh token");
  }

  refreshPromise = fetch(`${API_BASE_URL}/refresh.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok || !data.success) {
        clearAuth();
        throw new Error(data.message || "Session expired");
      }
      persistAuth(data);
      return data.access_token || data.token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function logoutRequest() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await fetch(`${API_BASE_URL}/logout.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {});
  }
  clearAuth();
}

export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(input, { ...init, headers });
  if (response.status !== 401) return response;

  const newToken = await refreshAccessToken();
  const retryHeaders = new Headers(init.headers || {});
  retryHeaders.set("Authorization", `Bearer ${newToken}`);
  response = await fetch(input, { ...init, headers: retryHeaders });
  if (response.status === 401) clearAuth();
  return response;
}

export async function openProtectedFile(filePath) {
  const url = `${API_BASE_URL}/serve_upload.php?file=${encodeURIComponent(filePath)}`;
  const response = await authFetch(url);
  if (!response.ok) {
    let message = "Could not open file";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // The file endpoint returns binary on success and JSON on errors.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}
