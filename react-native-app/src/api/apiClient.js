// src/api/apiClient.js
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) {
  throw new Error("API base URL is not defined in environment variables.");
}

// We chose to not use AsyncStorage to keep the tokens,
// so the user has to log in again after closing the app.
let inMemoryToken = null;
let authFailureHandler = null;

export function setToken(token) {
  inMemoryToken = token || null;
}

export function getToken() {
  return inMemoryToken;
}

export function setAuthFailureHandler(handler) {
  authFailureHandler = typeof handler === "function" ? handler : null;
}

// Centralized error object
export function makeHttpError(message, status, body) {
  const err = new Error(message);
  err.status = status;
  err.body = body;
  return err;
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const timeoutMs = options.timeoutMs ?? 15000;
  const skipAuthFailure = options.skipAuthFailure === true;

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401 && !skipAuthFailure) {
      setToken(null);
      authFailureHandler?.();
    }

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

// Upload file (with multipart/form-data)
export async function apiFetchMultipart(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const skipAuthFailure = options.skipAuthFailure === true;

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !skipAuthFailure) {
      setToken(null);
      authFailureHandler?.();
    }

    return response;
  } catch (err) {
    throw err;
  }
}
