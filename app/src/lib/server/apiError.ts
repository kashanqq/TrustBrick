/**
 * Extracts a safe error message for API responses.
 *
 * In production: logs the real error server-side and returns a generic message
 * so internal details (file paths, env var names, stack traces) never reach clients.
 * In development: returns the real message for easier debugging.
 */
export function apiErrorMessage(
  error: unknown,
  context: string,
  publicMessage = "Internal server error."
): string {
  const detail = error instanceof Error ? error.message : String(error);
  if (process.env.NODE_ENV === "production") {
    console.error(`[${context}]`, detail);
    return publicMessage;
  }
  return detail;
}
