import type { Tribe } from "@/types/api";

export type TribeRole = Tribe["role"];

export const DASHBOARD_PATH = "/dashboard" as const;

export function isAdminRole(role: TribeRole | null | undefined): boolean {
  return role === "admin";
}

export function isCreatorRole(role: TribeRole | null | undefined): boolean {
  return role === "creator";
}
