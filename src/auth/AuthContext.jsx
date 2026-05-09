import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearAuth,
  getAccessToken,
  getStoredUser,
  loginRequest,
  logoutRequest,
  refreshAccessToken,
} from "./authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getAccessToken()) {
        setInitializing(false);
        return;
      }

      try {
        await refreshAccessToken();
        if (active) setUser(getStoredUser());
      } catch {
        clearAuth();
        if (active) setUser(null);
      } finally {
        if (active) setInitializing(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user && getAccessToken()),
      login: async (email, password) => {
        const data = await loginRequest(email, password);
        setUser(data.user);
        return data;
      },
      logout: async () => {
        await logoutRequest();
        setUser(null);
      },
      refresh: refreshAccessToken,
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
