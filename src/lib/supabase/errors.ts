import type { PostgrestError } from "@supabase/supabase-js";

export type ServiceErrorCode =
  "authentication" | "permission" | "validation" | "network" | "database";

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;

  constructor(code: ServiceErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ServiceError";
    this.code = code;
  }
}

export function toServiceError(error: PostgrestError | Error | null): ServiceError {
  const message = error?.message.toLowerCase() ?? "";

  if (message.includes("jwt") || message.includes("not authenticated")) {
    return new ServiceError("authentication", "Please sign in to continue.", { cause: error });
  }
  if (
    error &&
    (error.code === "42501" || message.includes("permission") || message.includes("row-level"))
  ) {
    return new ServiceError("permission", "You do not have permission to perform this action.", {
      cause: error,
    });
  }
  if (message.includes("fetch") || message.includes("network") || message.includes("timeout")) {
    return new ServiceError(
      "network",
      "The service is temporarily unavailable. Please try again.",
      { cause: error },
    );
  }
  return new ServiceError("database", "We could not complete that request. Please try again.", {
    cause: error,
  });
}
