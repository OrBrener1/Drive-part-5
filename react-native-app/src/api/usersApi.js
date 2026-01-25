import { apiFetch, makeHttpError } from "./apiClient";
import { API_ENDPOINTS } from "./apiEndpoints";

export async function fetchCurrentUser() {
  const response = await apiFetch(API_ENDPOINTS.CURRENT_USER);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "FETCH_CURRENT_USER_FAILED",
      response.status,
      body
    );
  }

  return response.json();
}

// Theme preference
// Endpoint: GET /users/me/theme
export async function getThemePreference() {
  const response = await apiFetch(`${API_ENDPOINTS.CURRENT_USER}/theme`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "THEME_FETCH_FAILED",
      response.status,
      body
    );
  }

  return response.json();
}

// Endpoint: PUT /users/me/theme
export async function setThemePreference(theme) {
  const response = await apiFetch(`${API_ENDPOINTS.CURRENT_USER}/theme`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ theme }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw makeHttpError(
      body?.error || "THEME_UPDATE_FAILED",
      response.status,
      body
    );
  }

  // 204 No Content
  return true;
}
