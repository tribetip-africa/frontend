export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "tribetip-theme";

const THEME_PREFERENCES = new Set<ThemePreference>(["light", "dark", "system"]);

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return Boolean(value && THEME_PREFERENCES.has(value as ThemePreference));
}

export function readStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference;
}

export function applyThemePreference(preference: ThemePreference) {
  if (typeof document === "undefined") {
    return resolveTheme(preference);
  }

  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = preference;
  return resolved;
}

export function themePreferenceLabel(preference: ThemePreference, resolved: ResolvedTheme): string {
  if (preference === "system") {
    return `System (${resolved})`;
  }

  return preference === "dark" ? "Dark" : "Light";
}
