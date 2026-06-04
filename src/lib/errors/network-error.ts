import { TribetipError } from "@/lib/errors/tribetip-error";

export class TribetipNetworkError extends TribetipError {
  constructor(message = "Network error. Check your connection and try again.", cause?: unknown) {
    super({
      message,
      code: "network_error",
      source: "request",
      cause,
    });
  }
}
