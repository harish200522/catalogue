import { createContext, useContext, useState } from "react";
import { API_BASE } from "../config/api";

const AUTH_USERNAME = "inout@fashion";
const SESSION_KEY = "inout_admin_token";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!sessionStorage.getItem(SESSION_KEY)
  );
  const [token, setToken] = useState(
    () => sessionStorage.getItem(SESSION_KEY) || null
  );

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        let errorMsg = "Login failed";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {}
        return { success: false, error: errorMsg };
      }

      const data = await res.json();
      if (!data.token) throw new Error("No token in response");
      
      sessionStorage.setItem(SESSION_KEY, data.token);
      setToken(data.token);
      setIsLoggedIn(true);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
    setIsLoggedIn(false);
  };

  const changePassword = async (currentPwd, newPwd, confirmPwd) => {
    if (newPwd.length < 6)
      return { success: false, error: "Password must be at least 6 characters" };
    if (newPwd !== confirmPwd)
      return { success: false, error: "New passwords do not match" };
    
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ adminPassword: newPwd })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update password");
      }
      return { success: true };
    } catch (err) {
      console.error("Password change error:", err);
      return { success: false, error: err.message || "Failed to update password" };
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
