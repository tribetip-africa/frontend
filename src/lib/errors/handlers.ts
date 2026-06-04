import { TribetipApiError } from "@/lib/errors/api-error";
import { TribetipAuthError } from "@/lib/errors/auth-error";
import { TribetipNetworkError } from "@/lib/errors/network-error";
import { TribetipError } from "@/lib/errors/tribetip-error";
import { TribetipValidationError } from "@/lib/errors/validation-error";
import { normalizeError } from "@/lib/errors/parse";

export function getDisplayMessage(error: unknown): string {
  return normalizeError(error).message;
}

export function getErrorCode(error: unknown): string {
  return normalizeError(error).code;
}

export async function handleRequest<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw attachContext(normalizeError(error, "request"), context);
  }
}

export async function runSafe<T>(
  operation: () => Promise<T>,
  options: {
    context?: Record<string, unknown>;
    onError?: (error: TribetipError) => void;
    fallback?: T;
  } = {},
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const normalized = attachContext(normalizeError(error, "function"), options.context);
    options.onError?.(normalized);
    return options.fallback;
  }
}

export function withEventHandler(
  handler: (event: Event) => void | Promise<void>,
  options: {
    context?: Record<string, unknown>;
    onError?: (error: TribetipError, event: Event) => void;
  } = {},
): (event: Event) => Promise<void> {
  return async (event) => {
    try {
      await handler(event);
    } catch (error) {
      const normalized = attachContext(normalizeError(error, "event"), {
        ...options.context,
        eventType: event.type,
      });
      options.onError?.(normalized, event);
      throw normalized;
    }
  };
}

function attachContext(error: TribetipError, context?: Record<string, unknown>): TribetipError {
  if (!context || Object.keys(context).length === 0) return error;

  const details = { ...error.details, context };

  if (error instanceof TribetipApiError) {
    return new TribetipApiError(
      error.status ?? 0,
      error.body,
      error.message,
      error.code,
      details,
    );
  }

  if (error instanceof TribetipNetworkError) {
    return new TribetipNetworkError(error.message, error.cause);
  }

  if (error instanceof TribetipAuthError) {
    return new TribetipAuthError(error.message, error.status);
  }

  if (error instanceof TribetipValidationError) {
    return new TribetipValidationError(error.message, details);
  }

  return new TribetipError({
    message: error.message,
    code: error.code,
    status: error.status,
    details,
    cause: error.cause ?? error,
    source: error.source,
  });
}
