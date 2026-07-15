"use client";

import { createContext, useContext } from "react";
import type { CreatorProfile, Tribe } from "@/types/api";

export type DashboardContextValue = {
  tribe: Tribe;
  token: string | null;
  isAdmin: boolean;
  profile: CreatorProfile | null;
  profileError: string | null;
  onProfileChange: (profile: CreatorProfile) => void;
  blurred: boolean;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  value,
  children,
}: {
  value: DashboardContextValue;
  children: React.ReactNode;
}) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
