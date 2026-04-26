import { createContext, useContext, useState, useEffect } from "react";

const AUTH_USERNAME   = "inout@fashion";
const SESSION_KEY     = "inout_admin_logged_in";
const DEFAULT_PASSWORD = "INOUTKARUR";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );
  const [adminPassword, setAdminPassword] = useState(DEFAULT_PASSWORD);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.adminPassword) {
          setAdminPassword(data.adminPassword);
        }
      })
      .catch(err => console.error("Failed to fetch password:", err));
  }, []);

  const login = (username, password) => {
    if (username === AUTH_USERNAME && password === adminPassword) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsLoggedIn(true);
      return { success: true };
    }
    return { success: false, error: "Invalid username or password" };
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
  };

  const changePassword = async (currentPwd, newPwd, confirmPwd) => {
    if (currentPwd !== adminPassword)
      return { success: false, error: "Current password is incorrect" };
    if (newPwd.length < 6)
      return { success: false, error: "Password must be at least 6 characters" };
    if (newPwd !== confirmPwd)
      return { success: false, error: "New passwords do not match" };
    
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: newPwd })
      });
      if (!res.ok) throw new Error("Failed to update password");
      setAdminPassword(newPwd);
      return { success: true };
    } catch (err) {
      console.error("Password change error:", err);
      return { success: false, error: "Failed to update password" };
    }
  };

  const verifyPassword = (pwd) => pwd === adminPassword;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, changePassword, verifyPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
