// src/api/apiClient.js (React Native)
import { API_ENDPOINTS } from "./apiEndpoints";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined");
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

function makeHttpError(message, status, body) {
  const err = new Error(message);
  err.status = status;
  err.body = body;
  return err;
}

export async function apiFetch(path, options = {}) {
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
      headers,
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
    throw makeHttpError(
      "FETCH_CURRENT_USER_FAILED",
      response.status,
      null
    );
  }

  return response.json();
}

// Create file / folder
// Endpoint: POST /files
export async function createItem({ name, type, parentId, content }) {
  const response = await apiFetch(API_ENDPOINTS.FILES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      type,
      parentId: parentId ?? null,
      ...(type !== "folder" ? { content: content ?? "" } : {}),
    }),
  });

  if (response.status === 401) {
    throw makeHttpError("UNAUTHORIZED", 401, null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "CREATE_ITEM_FAILED",
      response.status,
      body
    );
  }

  return response.json();
}

// You can copy the rest of the endpoints as-is from your web apiClient,
// only replacing FormData usage accordingly (RN supports FormData too).
export { makeHttpError };
