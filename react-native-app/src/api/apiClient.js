// src/api/apiClient.js

if (!BASE_URL) {
  throw new Error("API base URL is not defined in environment variables.");
}

// We chose to not use AsyncStorage to keep the tokens, 
// so the user has to log in again after closing the app. 
let inMemoryToken = null;

export function setToken(token) {
  inMemoryToken = token || null;
}

export function getToken() {
  return inMemoryToken;
}

// Centralized error object
function makeHttpError(message, status, body) {
  const err = new Error(message);
  err.status = status;
  err.body = body;
  return err;
}

// async function readErrorBody(response) {
//   return response.json().catch(() => null);
// }

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const timeoutMs = options.timeoutMs ?? 15000;

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

  } catch (err) {
    if (err?.name === "AbortError") {
      throw makeHttpError("NETWORK_TIMEOUT", 0, null);
    }
    throw err;  
  }

  clearTimeout(timeoutId);

// CENTRALIZED AUTH HANDLING
  if (response.status === 401) {
    setToken(null);
    // TODO (later): trigger global logout handler
    // e.g. authContext.logout()
    return response;
  }

  return response;
}


// ---- Example ports of the functions you already have ----
// Keep the same API semantics so the rest of the app stays identical.

export async function fetchCurrentUser() {
  const response = await apiFetch(API_ENDPOINTS.CURRENT_USER);

  // Authentication error - let caller decide (e.g. logout)
  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  // Other server errors
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw makeHttpError(
      body?.error || "FETCH_CURRENT_USER_FAILED",
      response.status,
      body
    );
  }

  return response.json();
}

// Upload file (with multipart/form-data)
export async function apiFetchMultipart(path, options = {}) {
  console.log("MULTIPART FETCH:", `${BASE_URL}${path}`);
  const headers = { ...(options.headers || {}) };
  const timeoutMs = options.timeoutMs ?? 15000;

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers, // Do not set Content-Type header for multipart/form-data; let fetch handle it
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err?.name === "AbortError") {
      throw makeHttpError("NETWORK_TIMEOUT", 0, null);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// You can copy the rest of the endpoints as-is from your web apiClient,
// only replacing FormData usage accordingly (RN supports FormData too).
export { makeHttpError };
