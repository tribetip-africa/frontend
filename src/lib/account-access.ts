import type { Tribe } from "@/types/api";

export function accountStatusBanner(tribe: Pick<Tribe, "account_status">): {
  tone: "info" | "warning" | "danger";
  message: string;
} | null {
  switch (tribe.account_status) {
    case "pending":
      return {
        tone: "info",
        message:
          "Your account is pending. Complete payout setup to publish your page and withdraw tips.",
      };
    case "suspended":
      return {
        tone: "danger",
        message: "Your account is suspended. Contact support if you think this is a mistake.",
      };
    default:
      return null;
  }
}

export function isForbiddenError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) return false;
  return (error as { code?: unknown }).code === "forbidden";
}
