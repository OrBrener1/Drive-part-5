// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useMemo } from "react";
import * as authApi from "../api/authApi";
import { makeHttpError, setAuthFailureHandler, setToken } from "../api/apiClient";
import { fetchCurrentUser, updateAvatar } from "../api/usersApi";
import { getErrorMessage } from "../utils/errorMessages";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setAuthToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Login flow
  const login = async (email, password) => {
  setLoading(true);

  try {
    // Authenticate and receive JWT
    const { token } = await authApi.login(email, password);

    // Store token (context + api client)
    setAuthToken(token);
    setToken(token);

    // Fetch current user using the token
    const userData = await fetchCurrentUser();
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

  // Logout: clear all auth state
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setToken(null);
  };

  const confirmSessionExpired = () => {
    setSessionExpired(false);
    logout();
  };

  useEffect(() => {
    setAuthFailureHandler(() => setSessionExpired(true));
    return () => setAuthFailureHandler(null);
  }, []);
  
  // Register
  const register = async (email, password, displayName, image) => {

  try {
    await authApi.register(email, password, displayName, image);
 

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

  // Update user avatar (base64 string or null)
  const updateUserAvatar = async (image) => {
    try {
      const updatedUser = await updateAvatar(image);
      setUser(updatedUser);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: getErrorMessage(err, {
          context: "auth",
          fallback: "Avatar update failed",
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
      updateUserAvatar,
      sessionExpired,
      confirmSessionExpired,
    }),
    [token, user, loading, sessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
