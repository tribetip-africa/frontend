import { TribetipError } from "@/lib/errors/tribetip-error";

export class TribetipAuthError extends TribetipError {
  constructor(message = "Authentication required.", status = 401) {
    super({
      message,
      code: "authentication_failed",
      status,
      source: "request",
    });
  }
}
