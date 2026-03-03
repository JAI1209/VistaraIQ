import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getApiErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    const response = await api.get("/me");
    setUser(response.data.user);
    return response.data.user;
  }

  async function login(payload) {
    const response = await api.post("/login", payload);
    setUser(response.data.user);
    return response.data;
  }

  async function register(payload) {
    const response = await api.post("/register", payload);
    setUser(response.data.user);
    return response.data;
  }

  async function logout() {
    try {
      await api.post("/logout");
    } finally {
      setUser(null);
    }
  }

  async function forgotPassword(email) {
    return api.post("/forgot-password", { email });
  }

  async function resetPassword(token, password) {
    return api.post("/reset-password", { token, password });
  }

  async function verifyEmail(token) {
    return api.post("/verify-email", { token });
  }

  async function resendVerification(email) {
    return api.post("/resend-verification", { email });
  }

  useEffect(() => {
    let mounted = true;
    fetchMe()
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      register,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
      fetchMe,
      getApiErrorMessage,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
