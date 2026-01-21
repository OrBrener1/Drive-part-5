// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useMemo } from "react";
import * as authApi from "../api/authApi";
import { apiFetch, makeHttpError, setToken } from "../api/apiClient";
import { API_ENDPOINTS } from "../api/apiEndpoints";
import { getErrorMessage } from "../utils/errorMessages";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
  setLoading(true);

  try {
    // Authenticate and receive JWT
    const { token } = await authApi.login(email, password);

    // Store token (context + api client)
    setAuthToken(token);
    setToken(token);

    // Fetch current user using the token
    const res = await apiFetch(API_ENDPOINTS.CURRENT_USER);

    // Token invalid / expired → force logout and stop flow
    if (res.status === 401) {
      logout();
      return { ok: false, message: "Session expired" };
    }

    //Other server error
    if (!res.ok) {
      throw makeHttpError(
        "FETCH_CURRENT_USER_FAILED",
        res.status,
        null
      );
    }

    //Success: save user and finish login
    const userData = await res.json();
    setUser(userData);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: getErrorMessage(err, {
        context: "auth",
        fallback: "Login failed",
      }),
    };
  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setToken(null);
  };

  const register = async (email, password, displayName) => {

  try {
    await authApi.register(email, password, displayName);
 

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: getErrorMessage(err, {
        context: "auth",
        fallback: "Registration failed",
      }),
    };
  }
};

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
      register,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
