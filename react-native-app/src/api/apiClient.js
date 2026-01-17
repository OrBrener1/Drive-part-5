// src/api/apiClient.js (React Native)

const BASE_URL = "http://192.168.1.158:5000/api";

// We chose to not use AsyncStorage to keep the tokens, 
// so the user has to log in again after closing the app. 
let inMemoryToken = null;

export function setToken(token) {
  inMemoryToken = token || null;
}

export function getToken() {
  return inMemoryToken;
}

function makeHttpError(message, status, body) {
  const err = new Error(message);
  err.status = status;
  err.body = body;
  return err;
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return response;
}

// ---- Example ports of the functions you already have ----
// Keep the same API semantics so the rest of the app stays identical.

export async function fetchCurrentUser() {
  const response = await apiFetch(API_ENDPOINTS.CURRENT_USER);

  if (response.status === 401) throw makeHttpError("UNAUTHORIZED", 401, null);
  if (!response.ok) throw makeHttpError("FETCH_CURRENT_USER_FAILED", response.status, null);

  return response.json();
}

// You can copy the rest of the endpoints as-is from your web apiClient,
// only replacing FormData usage accordingly (RN supports FormData too).
export { makeHttpError };
