# Realtime Library

Shared Socket.IO authentication and Redis fan-out infrastructure.

## Purpose

`@app/realtime` provides an authenticated WebSocket adapter and common socket
types without owning application event names or realtime business rules.

## Exports

- `JwtRedisSocketAdapter` validates bearer tokens during the Socket.IO
  handshake and installs the Redis adapter.
- Authenticated socket request and user types.
- `extractBearerToken` for handshake parsing.

## Runtime dependencies

The adapter requires a configured `JwtService`, an access-token secret, and
Redis publisher/subscriber clients.

## Boundaries

- Never log bearer tokens or decoded authentication payloads.
- Applications own rooms, event schemas, authorization, and rate limiting.
- Keep transport authentication separate from tenant permission checks.

## Importing

```ts
import { JwtRedisSocketAdapter } from '@app/realtime';
```
