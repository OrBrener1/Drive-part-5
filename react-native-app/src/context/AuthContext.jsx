// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useMemo } from "react";
import * as authApi from "../api/authApi";
import { apiFetch, makeHttpError, setToken } from "../api/apiClient";
import { API_ENDPOINTS } from "../api/apiEndpoints";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { token } = await authApi.login(email, password);
      setAuthToken(token);
      setToken(token);

      // fetch current user
      const res = await apiFetch(API_ENDPOINTS.CURRENT_USER);
      if (res.status === 401) {
        throw makeHttpError("UNAUTHORIZED", 401, null);
      }
      if (!res.ok) {
        throw makeHttpError("FETCH_CURRENT_USER_FAILED", res.status, null);
      }
      const userData = await res.json();
      setUser(userData);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
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
      message: err.message,
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
