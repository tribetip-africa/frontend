export { TribetipError, isTribetipError } from "@/lib/errors/tribetip-error";
export type {
  ErrorSource,
  TribetipErrorDetails,
  TribetipErrorPayload,
} from "@/lib/errors/tribetip-error";

export { TribetipApiError } from "@/lib/errors/api-error";
export { TribetipNetworkError } from "@/lib/errors/network-error";
export { TribetipValidationError } from "@/lib/errors/validation-error";
export { TribetipAuthError } from "@/lib/errors/auth-error";

export { parseApiErrorBody, normalizeError } from "@/lib/errors/parse";
export type { ApiErrorBody } from "@/lib/errors/parse";

export {
  getDisplayMessage,
  getErrorCode,
  handleRequest,
  runSafe,
  withEventHandler,
} from "@/lib/errors/handlers";
