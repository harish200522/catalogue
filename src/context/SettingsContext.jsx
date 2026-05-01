import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../config/api";

const DEFAULTS = {
  whatsappNumber: "919791639162",
  instagramLink:
    "https://www.instagram.com/inout_fashions_showroom?igsh=MTMyaDlxcGt3MjA4cQ==",
  siteName: "INOUT Admin",
};

export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  // ── Load from server on mount ────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const validated = data && typeof data === 'object' ? data : {};
        setSettings({ ...DEFAULTS, ...validated });
      })
      .catch(() => {}); // keep defaults if server unreachable
  }, []);

  // ── Optimistic update + server sync ─────────────────────────────────
  const updateSettings = (partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    
    const token = sessionStorage.getItem("inout_admin_token");
    if (!token) {
      console.error("Not authenticated");
      return;
    }

    fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(partial),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .catch((err) => {
        console.error("Update settings error:", err);
        // Revert to previous state on error
      });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
