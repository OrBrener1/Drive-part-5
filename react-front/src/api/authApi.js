// src/api/authApi.js

import { apiFetch } from "./apiClient";
import { API_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Sends a login request to the server.
 * This layer is responsible only for authentication-related API calls.
 * It does not store the token or handle application state.
 * Sends user credentials to the server and expects a JWT token in response.
 */
export async function loginRequest(email, password) {
  // Send POST request to the authentication endpoint
 const response = await apiFetch(API_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  // Handle non-success HTTP statuses
  if (!response.ok) {
    let message = "Login failed";

    // Attempt to read an error message from the response body
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch (e) {
      // Response body is not valid JSON; keep default message
    }

    return {
      ok: false,
      status: response.status,
      message,
    };
  }

  // Parse successful response body
  const data = await response.json();

  // Return the JWT token to the caller
  return {
    ok: true,
    token: data.token,
  };
}

  /**
 * Sends a registration request to the server. 
 * This function only communicates with the backend and returns the result.
 **/
 export async function registerUser(userData) {
  const response = await apiFetch(API_ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    let message = "Registration failed";

    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch (e) {}

    return {
      ok: false,
      status: response.status,
      message,
    };
  }

  return {
    ok: true,
  };
}