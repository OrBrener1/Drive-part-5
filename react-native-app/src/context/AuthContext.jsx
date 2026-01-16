// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useMemo } from "react";
import { login as loginApi } from "../api/authApi";
import { apiFetch, setToken } from "../api/apiClient";
import { API_ENDPOINTS } from "../api/apiEndpoints";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { token } = await loginApi(email, password);

      setAuthToken(token);
      setToken(token);

      // fetch current user
      const res = await apiFetch(API_ENDPOINTS.CURRENT_USER);
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

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
