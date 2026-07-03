"use client";

/**
 * Theme system — light / dark with `system` as the initial mode.
 *
 * Color tokens live as CSS variables in globals.css; we only flip the
 * `data-theme` attribute on <html> here. Switching cost is one DOM
 * attribute write — every consumer (Tailwind class, shader uniform,
 * fish system) reads off that.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "system";

const STORAGE_KEY = "minty-pisces-theme";

type ThemeContextValue = {
  resolved: ThemeMode;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readPreference(): ThemePreference {
  if (typeof localStorage === "undefined") return "system";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

function systemMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read whatever the early <script> applied — keeps SSR / first paint stable.
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ThemeMode>("light");

  useEffect(() => {
    const pref = readPreference();
    setPreferenceState(pref);
    const initial = pref === "system" ? systemMode() : pref;
    setResolved(initial);
    applyMode(initial);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      // Only react to system change while preference is `system`.
      if (readPreference() !== "system") return;
      const next = mql.matches ? "dark" : "light";
      setResolved(next);
      applyMode(next);
    };
    mql.addEventListener?.("change", onSystem);
    return () => mql.removeEventListener?.("change", onSystem);
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    localStorage.setItem(STORAGE_KEY, p);
    setPreferenceState(p);
    const next = p === "system" ? systemMode() : p;
    setResolved(next);
    applyMode(next);
  }, []);

  const toggle = useCallback(() => {
    // Toggle ignores `system`: you click, you've expressed an opinion.
    setPreference(resolved === "dark" ? "light" : "dark");
  }, [resolved, setPreference]);

  return (
    <ThemeContext.Provider value={{ resolved, preference, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/**
 * Inline script string injected in <head> before any paint, so we never
 * flash the wrong theme. Kept tiny and dependency-free.
 */
export const THEME_INIT_SCRIPT = `
(function(){try{
  var k='${STORAGE_KEY}';
  var p=localStorage.getItem(k);
  var m = (p==='light'||p==='dark') ? p
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  var r=document.documentElement;
  r.dataset.theme=m;
  r.style.colorScheme=m;
}catch(e){}})();
`;
