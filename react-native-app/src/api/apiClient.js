// src/api/apiClient.js (React Native)
import { Platform } from "react-native";
import Constants from "expo-constants";
import { API_ENDPOINTS } from "./apiEndpoints";

const DEFAULT_DEVICE_URL = "http://172.20.10.2:5000/api";
const DEFAULT_ANDROID_EMULATOR_URL = "http://10.0.2.2:5000/api";
const DEFAULT_IOS_SIMULATOR_URL = "http://localhost:5000/api";

const ENV_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_URL =
  ENV_URL ||
  (Platform.OS === "android" && !Constants.isDevice
    ? DEFAULT_ANDROID_EMULATOR_URL
    : Platform.OS === "ios" && !Constants.isDevice
      ? DEFAULT_IOS_SIMULATOR_URL
      : DEFAULT_DEVICE_URL);

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
