# Auth Library

Shared JWT contracts, strategies, and token-provider implementation.

## Purpose

`@app/auth` centralizes authentication mechanics used by Identity and the API
Gateway. It does not make tenant authorization decisions.

## Exports

- `AuthPayload`, `AuthTokens`, and `AuthTokenProviderPort`.
- `JwtAuthModule` and the JWT token adapter.
- Access-token and refresh-token Passport strategies.
- Validated JWT configuration.

## Configuration

- `JWT_ACCESS_TOKEN_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRATION_TIME`
- `JWT_REFRESH_TOKEN_SECRET`
- `JWT_REFRESH_TOKEN_EXPIRATION_TIME`

Secrets are required and have no checked-in defaults. Use independent values
from a runtime secret manager.

## Boundaries

- Never log token payloads, raw tokens, or signing secrets.
- Applications own route policy and user lifecycle rules.
- Authorization belongs to the Authorization service.

## Importing

```ts
import { AuthPayload, JwtAuthModule } from '@app/auth';
```
