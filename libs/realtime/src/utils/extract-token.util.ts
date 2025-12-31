export function extractBearerToken(
  authHeader?: string,
): string | null {
  if (!authHeader) return null;
  return authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;
}
