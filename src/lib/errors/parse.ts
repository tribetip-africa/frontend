import { TribetipApiError } from "@/lib/errors/api-error";
import { TribetipError, type TribetipErrorDetails } from "@/lib/errors/tribetip-error";
import { TribetipNetworkError } from "@/lib/errors/network-error";

export type ApiErrorBody = {
  error?: string | TribetipErrorDetails & { code?: string; message?: string };
  errors?: string[];
};

export function parseApiErrorBody(
  status: number,
  body: ApiErrorBody,
): TribetipApiError {
  const structured =
    body.error && typeof body.error === "object" ? (body.error as TribetipErrorDetails) : null;

  const details: TribetipErrorDetails = {
    ...(structured ?? {}),
    ...(body.errors ? { errors: body.errors } : {}),
  };

  return new TribetipApiError(
    status,
    body as Record<string, unknown>,
    undefined,
    typeof structured?.code === "string" ? structured.code : undefined,
    Object.keys(details).length > 0 ? details : undefined,
  );
}

export function normalizeError(error: unknown, source: TribetipError["source"] = "unknown"): TribetipError {
  if (error instanceof TribetipError) {
    if (error.source === "unknown" && source !== "unknown") {
      return new TribetipError({
        message: error.message,
        code: error.code,
        status: error.status,
        details: error.details,
        cause: error.cause,
        source,
      });
    }
    return error;
  }

  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return new TribetipNetworkError(undefined, error);
  }

  if (error instanceof Error) {
    return new TribetipError({
      message: error.message,
      code: "unexpected_error",
      cause: error,
      source,
    });
  }

  return new TribetipError({
    message: "Something went wrong. Please try again.",
    code: "unknown",
    source,
  });
}
