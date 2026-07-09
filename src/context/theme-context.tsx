"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
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

type ThemeSnapshot = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
};

type ThemeContextValue = ThemeSnapshot & {
  label: string;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PREFERENCE_ORDER: ThemePreference[] = ["light", "dark", "system"];

const SERVER_SNAPSHOT: ThemeSnapshot = {
  preference: "system",
  resolvedTheme: "light",
};

let cachedThemeSnapshot: ThemeSnapshot = SERVER_SNAPSHOT;

function getThemeSnapshot(): ThemeSnapshot {
  const preference = readStoredThemePreference();
  const resolvedTheme = resolveTheme(preference);

  if (
    cachedThemeSnapshot.preference === preference &&
    cachedThemeSnapshot.resolvedTheme === resolvedTheme
  ) {
    return cachedThemeSnapshot;
  }

  cachedThemeSnapshot = { preference, resolvedTheme };
  return cachedThemeSnapshot;
}

function subscribeTheme(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => onStoreChange();

  window.addEventListener("tribetip-theme", handleChange);
  window.addEventListener("storage", handleChange);
  media.addEventListener("change", handleChange);

  return () => {
    window.removeEventListener("tribetip-theme", handleChange);
    window.removeEventListener("storage", handleChange);
    media.removeEventListener("change", handleChange);
  };
}

function notifyThemeSubscribers() {
  window.dispatchEvent(new Event("tribetip-theme"));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => SERVER_SNAPSHOT);

  useLayoutEffect(() => {
    applyThemePreference(snapshot.preference);
  }, [snapshot.preference, snapshot.resolvedTheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    applyThemePreference(next);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (private mode, etc.).
    }

    notifyThemeSubscribers();
  }, []);

  const cyclePreference = useCallback(() => {
    const currentIndex = PREFERENCE_ORDER.indexOf(snapshot.preference);
    const next = PREFERENCE_ORDER[(currentIndex + 1) % PREFERENCE_ORDER.length];
    setPreference(next);
  }, [setPreference, snapshot.preference]);

  const value = useMemo(
    () => ({
      ...snapshot,
      label: themePreferenceLabel(snapshot.preference, snapshot.resolvedTheme),
      setPreference,
      cyclePreference,
    }),
    [snapshot, setPreference, cyclePreference],
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
