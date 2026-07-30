// ─────────────────────────────────────────────────────────────────────────
// Error-message sanitisation (MED-1).
//
// Anything that isn't an HttpException is, by definition, unexpected: a Prisma
// error, a driver failure, a TypeError. Their `message` routinely names tables,
// columns, constraints and query fragments — internal schema detail that has no
// business reaching an API client. In production we return a fixed string and
// keep the real message in the server log, correlated by request id.
//
// Pure + dependency-free so the rule is unit-testable on its own.
// ─────────────────────────────────────────────────────────────────────────

/** What clients see instead of an unexpected error's real message. */
export const GENERIC_ERROR_MESSAGE = 'Internal server error'

export interface SanitizedError {
  /** Safe to send to the client. */
  clientMessage: string
  /** Full detail for the server log (never serialised into the response). */
  logMessage: string
}

/**
 * @param error       the thrown value (already known not to be an HttpException)
 * @param isProduction hide details when true; surface them in dev for DX
 */
export function sanitizeUnexpectedError(error: unknown, isProduction: boolean): SanitizedError {
  const logMessage = error instanceof Error ? error.message : String(error)
  return {
    clientMessage: isProduction ? GENERIC_ERROR_MESSAGE : logMessage,
    logMessage,
  }
}
