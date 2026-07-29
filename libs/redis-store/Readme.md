# Redis Store Library

Reusable Redis-backed key-value repository bases.

## Purpose

`@app/redis-store` implements common `KeyValueStorePort` operations while
letting each service own its namespace, key value object, serialization, and
expiry policy.

## Exports

- `GlobalRedisRepositoryBase`
- `TenantRedisRepositoryBase`
- `RedisStoreModule`

Subclasses implement `buildNamespace`, `serialize`, and `deserialize`. Tenant
repositories also include tenant scope in their keys.

## Boundaries

- Namespaces must be stable and collision-resistant.
- Do not serialize plaintext secrets when a hash or opaque token is sufficient.
- Set an explicit TTL for short-lived sessions.
- This library depends on `@app/redis` for the client connection.

## Importing

```ts
import { GlobalRedisRepositoryBase, RedisStoreModule } from '@app/redis-store';
```
