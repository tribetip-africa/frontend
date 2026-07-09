"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyThemePreference,
  readStoredThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  themePreferenceLabel,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  label: string;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PREFERENCE_ORDER: ThemePreference[] = ["light", "dark", "system"];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const preferenceRef = useRef<ThemePreference>("system");

  useEffect(() => {
    const stored = readStoredThemePreference();
    preferenceRef.current = stored;
    setPreferenceState(stored);
    setResolvedTheme(applyThemePreference(stored));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      setResolvedTheme(applyThemePreference(preferenceRef.current));
    };

    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    preferenceRef.current = next;
    setPreferenceState(next);
    setResolvedTheme(applyThemePreference(next));

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (private mode, etc.).
    }
  }, []);

  const cyclePreference = useCallback(() => {
    const currentIndex = PREFERENCE_ORDER.indexOf(preference);
    const next = PREFERENCE_ORDER[(currentIndex + 1) % PREFERENCE_ORDER.length];
    setPreference(next);
  }, [preference, setPreference]);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      label: themePreferenceLabel(preference, resolvedTheme),
      setPreference,
      cyclePreference,
    }),
    [preference, resolvedTheme, setPreference, cyclePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
