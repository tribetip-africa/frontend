export type ErrorSource = "request" | "function" | "event" | "unknown";

export type TribetipErrorDetails = Record<string, unknown>;

export type TribetipErrorPayload = {
  code: string;
  message: string;
  details?: TribetipErrorDetails;
};

export type TribetipErrorOptions = {
  message: string;
  code?: string;
  status?: number;
  details?: TribetipErrorDetails;
  cause?: unknown;
  source?: ErrorSource;
};

export class TribetipError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details?: TribetipErrorDetails;
  readonly cause?: unknown;
  readonly source: ErrorSource;

  constructor(options: TribetipErrorOptions) {
    super(options.message);
    this.name = new.target.name;
    this.code = options.code ?? "unknown";
    this.status = options.status;
    this.details = options.details;
    this.cause = options.cause;
    this.source = options.source ?? "unknown";
  }

  toJSON(): TribetipErrorPayload {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export function isTribetipError(error: unknown): error is TribetipError {
  return error instanceof TribetipError;
}
