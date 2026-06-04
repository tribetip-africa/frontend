import { TribetipError, type TribetipErrorDetails } from "@/lib/errors/tribetip-error";

export class TribetipValidationError extends TribetipError {
  constructor(message = "Validation failed.", details?: TribetipErrorDetails) {
    super({
      message,
      code: "validation_failed",
      status: 422,
      details,
      source: "function",
    });
  }
}
