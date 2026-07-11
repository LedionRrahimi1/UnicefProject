import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, AccessibilitySettings } from "./types";
import { authService } from "./services";
import { isSupabaseEnabled } from "./supabase";

interface AppState {
  user: User | null;
  authReady: boolean;
  login: (user: User) => void;
  logout: () => void;
  accessibility: AccessibilitySettings;
  setAccessibility: (s: Partial<AccessibilitySettings>) => void;
  accessibilityOpen: boolean;
  setAccessibilityOpen: (v: boolean) => void;
}

const defaults: AccessibilitySettings = {
  fontSize: 16,
  lineSpacing: 1.6,
  letterSpacing: 0,
  highContrast: false,
  darkMode: false,
  readingFont: "inter",
  reducedMotion: false,
  appLanguage: "sq",
};

const AppContext = createContext<AppState>({
  user: null,
  authReady: true,
  login: () => {},
  logout: () => {},
  accessibility: defaults,
  setAccessibility: () => {},
  accessibilityOpen: false,
  setAccessibilityOpen: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem("mesolehte_user") ?? "null"); } catch { return null; }
  });
  const [authReady, setAuthReady] = useState(!isSupabaseEnabled());

  const [accessibility, setAccessibilityState] = useState<AccessibilitySettings>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mesolehte_a11y") ?? "{}") as Partial<AccessibilitySettings>;
      return {
        ...defaults,
        ...saved,
        appLanguage: saved.appLanguage === "en" ? "en" : "sq",
      };
    } catch {
      return defaults;
    }
  });

  const [accessibilityOpen, setAccessibilityOpen] = useState(false);

  const login = useCallback((u: User) => {
    setUser(u);
    localStorage.setItem("mesolehte_user", JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("mesolehte_user");
    void authService.logout();
  }, []);

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      setAuthReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const sessionUser = await authService.getSessionUser();
      if (cancelled) return;
      if (sessionUser) {
        setUser(sessionUser);
        localStorage.setItem("mesolehte_user", JSON.stringify(sessionUser));
      }
      setAuthReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const setAccessibility = useCallback((s: Partial<AccessibilitySettings>) => {
    setAccessibilityState(prev => {
      const next = { ...prev, ...s };
      localStorage.setItem("mesolehte_a11y", JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${accessibility.fontSize}px`;
    root.lang = accessibility.appLanguage === "en" ? "en" : "sq";
    if (accessibility.darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    if (accessibility.highContrast) root.setAttribute("data-high-contrast", "true");
    else root.removeAttribute("data-high-contrast");
  }, [accessibility]);

  return (
    <AppContext.Provider value={{ user, authReady, login, logout, accessibility, setAccessibility, accessibilityOpen, setAccessibilityOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
