import { createContext, useContext, useState, useEffect } from "react";

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
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings({ ...DEFAULTS, ...data }))
      .catch(() => {}); // keep defaults if server unreachable
  }, []);

  // ── Optimistic update + server sync ─────────────────────────────────
  const updateSettings = (partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
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
