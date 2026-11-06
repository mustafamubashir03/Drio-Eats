/**
 * Extract a human-readable message from an axios/network/Better Auth error.
 */
export function apiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const e = error as {
    response?: { data?: { message?: string; error?: string } };
    message?: string;
  };
  return e?.response?.data?.message || e?.response?.data?.error || e?.message || fallback;
}
