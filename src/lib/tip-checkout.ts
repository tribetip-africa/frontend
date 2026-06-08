export type TipCheckoutPhase = "idle" | "starting" | "polling" | "redirecting";

export function isCheckoutStillProcessing(message: string): boolean {
  return message.toLowerCase().includes("still processing");
}

export function checkoutPhaseLabel(phase: TipCheckoutPhase): string {
  switch (phase) {
    case "starting":
      return "Starting checkout…";
    case "polling":
      return "Preparing Paystack checkout…";
    case "redirecting":
      return "Redirecting to Paystack…";
    default:
      return "Tip";
  }
}
