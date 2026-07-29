# Identity service

The Identity service owns user accounts, authentication workflows, and
verification sessions. It exposes an internal gRPC API used by the API Gateway
and delegates verification-code delivery to the Notifications service.

## Responsibilities

- Register, authenticate, and manage users.
- Issue and refresh access and refresh tokens.
- Create short-lived verification sessions for account verification, password
  reset, and phone-number changes.
- Hash verification codes before storing sessions in Redis.
- Persist user account data in MongoDB.
- Request verification-code delivery through the Notifications gRPC contract.

Authorization policies and tenant lifecycle data are owned by their respective
services.

## Runtime dependencies

- MongoDB for user records.
- Redis for verification sessions and token-related state.
- Notifications service at `NOTIFICATIONS_GRPC_URL`.

Start Notifications before exercising flows that create or resend verification
sessions. Its default dry-run drivers let the full call path operate locally
without provider credentials.

## Configuration

| Variable                            | Purpose                      | Example                              |
| ----------------------------------- | ---------------------------- | ------------------------------------ |
| `IDENTITY_GRPC_BIND_URL`            | Identity server bind address | `0.0.0.0:50051`                      |
| `NOTIFICATIONS_GRPC_URL`            | Notifications client address | `127.0.0.1:50054`                    |
| `DATABASE_URL_IDENTITY`             | Identity MongoDB connection  | `mongodb://localhost:27017/identity` |
| `REDIS_URL`                         | Redis connection             | `redis://localhost:6379`             |
| `JWT_ACCESS_TOKEN_SECRET`           | Access-token signing secret  | Runtime secret                       |
| `JWT_ACCESS_TOKEN_EXPIRATION_TIME`  | Access-token lifetime        | `15m`                                |
| `JWT_REFRESH_TOKEN_SECRET`          | Refresh-token signing secret | Runtime secret                       |
| `JWT_REFRESH_TOKEN_EXPIRATION_TIME` | Refresh-token lifetime       | `7d`                                 |

Signing secrets must be long, independently generated values supplied by the
runtime environment. Do not commit them.

## Verification flow

1. Identity generates a random verification token and one-time code.
2. The code is hashed and the session is persisted in Redis.
3. Identity sends the raw code to Notifications over internal gRPC.
4. Identity returns only the verification token to the caller.
5. Confirmation compares the submitted code with the stored hash and consumes
   the session.

Application logs do not include raw codes, verification tokens, phone numbers,
message content, or provider credentials.

## Run and verify

From the repository root:

```bash
npm run start:dev:identity
npm run build:identity
npm run test:unit -- --runTestsByPath apps/identity-service/src/config/identity.config.schema.spec.ts apps/identity-service/src/identity/verification-session/application/services/verification-session.service.spec.ts apps/identity-service/src/identity/verification-session/infrastructure/notifications-grpc.adapter.spec.ts
```

## Structure

- `config/` validates service-owned network configuration.
- `identity/user/` contains user commands, queries, domain logic, transport, and
  persistence.
- `identity/verification-session/` contains the verification domain,
  Redis-backed repository, and Notifications client adapter.

The verification application service depends on
`VerificationNotificationPort`; the gRPC adapter is an infrastructure detail.
