"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { applyThemePreference, readStoredThemePreference } from "@/lib/theme";

/**
 * Dashboard stays light for readability. Site-wide theme preference is
 * restored when leaving the workspace.
 */
export function DashboardThemeScope({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const preference = readStoredThemePreference();

    root.classList.remove("dark");

    return () => {
      applyThemePreference(preference);
    };
  }, []);

  return children;
}
