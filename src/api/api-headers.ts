// Shared helper for constructing API headers with optional session and bearer token

export function buildApiHeaders(sessionId?: string, bearerToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }
  return headers;
}
