# Redis Library

Shared Redis client configuration, lifecycle, and dependency injection.

## Purpose

`@app/redis` owns the reusable Redis connection boundary. Services consume the
`RedisClientPort` rather than constructing independent clients.

## Exports

- `RedisClientModule`
- `RedisClientPort`
- Validated Redis configuration

## Configuration

`REDIS_URL` is required and must be a valid Redis URI. Supply credentials
through the runtime environment; do not commit them.

## Boundaries

- This library manages connectivity, not service key formats.
- Domain serialization and namespaces belong in repository adapters.
- Callers should not log connection strings or stored values.

## Importing

```ts
import { RedisClientModule, RedisClientPort } from '@app/redis';
```
