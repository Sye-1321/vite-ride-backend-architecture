import { IncomingHttpHeaders } from 'http';

interface SocketHandshake {
  auth: Record<string, unknown>;
  headers: IncomingHttpHeaders;
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  return match?.[1]?.trim() || null;
}

export function extractSocketToken(handshake: SocketHandshake): string | null {
  const authToken = handshake.auth?.accessToken;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.trim();
  }

  const authorization = handshake.headers.authorization;
  return extractBearerToken(Array.isArray(authorization) ? authorization[0] : authorization);
}
