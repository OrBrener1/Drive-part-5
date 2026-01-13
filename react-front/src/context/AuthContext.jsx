// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { loginRequest } from '../api/authApi';
import { fetchCurrentUser, setToken as persistToken } from '../api/apiClient';

// Create a context object for authentication state
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Holds the JWT token in React state
  // If token exists, the user is considered authenticated
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(false);

  // On initial application load, try to restore the token
  // from localStorage to keep the user logged in after refresh
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
    }
    // Authentication initialization is complete
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadCurrentUser() {
      if (!token) {
        setUser(null);
        setIsUserLoading(false);
        return;
      }

      setIsUserLoading(true);
      try {
        const data = await fetchCurrentUser();
        if (!isActive) return;
        setUser(data);
      } catch (err) {
        if (!isActive) return;
        setUser(null);
        setToken(null);
        persistToken(null);
      } finally {
        if (isActive) {
          setIsUserLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isActive = false;
    };
  }, [token]);

  /**
   * Performs user login by calling the authentication API.
   * This function does not handle navigation or UI logic.
   */
  const login = async (email, password) => {
    // Send credentials to the backend via authApi
    const result = await loginRequest(email, password);

    // If login failed, return the error to the caller
    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
      };
    }

    // Store the JWT in React state so the app knows the user is authenticated
    setToken(result.token);

    // Persist the token so apiFetch can attach it to future requests
    persistToken(result.token);

    // Notify caller that login was successful
    return { ok: true };
  };

  /**
   * Logs out the user by clearing authentication state
   * and removing the persisted token.
   */
  const logout = () => {
    // Clear token from React state
    setToken(null);
    setUser(null);

    // Remove token from localStorage so it is no longer sent to the server
    persistToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        // Expose the raw token if needed
        token,
        user,

        // Convenience flag for protected routes and UI logic
        isAuthenticated: Boolean(token),

        // Authentication actions
        isLoading: isLoading || isUserLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
