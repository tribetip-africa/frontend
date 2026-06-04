import { TribetipError, type TribetipErrorDetails } from "@/lib/errors/tribetip-error";

export class TribetipApiError extends TribetipError {
  readonly body: Record<string, unknown>;

  constructor(
    status: number,
    body: Record<string, unknown>,
    message?: string,
    code?: string,
    details?: TribetipErrorDetails,
  ) {
    super({
      message: message ?? TribetipApiError.defaultMessage(body),
      code: code ?? TribetipApiError.defaultCode(status),
      status,
      details,
      source: "request",
    });
    this.body = body;
  }

  private static defaultMessage(body: Record<string, unknown>): string {
    const structured = body.error;
    if (structured && typeof structured === "object" && "message" in structured) {
      const message = (structured as { message?: unknown }).message;
      if (typeof message === "string" && message.length > 0) return message;
    }

    if (typeof body.error === "string" && body.error.length > 0) return body.error;

    const errors = body.errors;
    if (Array.isArray(errors) && errors.every((item) => typeof item === "string")) {
      return errors.join(", ");
    }

    return "Request failed.";
  }

  private static defaultCode(status: number): string {
    if (status === 401) return "authentication_failed";
    if (status === 403) return "forbidden";
    if (status === 404) return "not_found";
    if (status === 422) return "validation_failed";
    if (status === 429) return "rate_limited";
    if (status >= 500) return "internal_error";
    return "request_failed";
  }
}
