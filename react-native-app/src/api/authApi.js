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
    let message = "Login failed";
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch {}
    throw makeHttpError(message, response.status, null);
  }

  return response.json(); // expected: { token }
}
