// src/api/authApi.js

import { apiFetch, makeHttpError } from "./apiClient";
import { API_ENDPOINTS } from "./apiEndpoints";

export async function login(email, password) {
  const response = await apiFetch(API_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.message || data.error || "Login failed";
    throw makeHttpError(message, response.status, data);
  }

  return response.json(); // expected: { token }
}

export async function register(email, password, displayName, image) {
  console.log("REGISTER PAYLOAD IMAGE:", image?.slice(0, 30));
  const response = await apiFetch(API_ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      displayName,
      image // Base64 string (or null)
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.message || data.error || "Registration failed";
    throw makeHttpError(message, response.status, data);
  }

  return response.json();
}

