import { createContext, useContext, useState } from "react";

const AUTH_USERNAME   = "inout@fashion";
const PASSWORD_KEY    = "inout_admin_password";
const SESSION_KEY     = "inout_admin_logged_in";
const DEFAULT_PASSWORD = "INOUTKARUR";

function getStoredPassword() {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
}

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );

  const login = (username, password) => {
    if (username === AUTH_USERNAME && password === getStoredPassword()) {
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

  const changePassword = (currentPwd, newPwd, confirmPwd) => {
    if (currentPwd !== getStoredPassword())
      return { success: false, error: "Current password is incorrect" };
    if (newPwd.length < 6)
      return { success: false, error: "Password must be at least 6 characters" };
    if (newPwd !== confirmPwd)
      return { success: false, error: "New passwords do not match" };
    localStorage.setItem(PASSWORD_KEY, newPwd);
    return { success: true };
  };

  const verifyPassword = (pwd) => pwd === getStoredPassword();

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
