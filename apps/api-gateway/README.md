# API Gateway

The API Gateway is the public HTTP boundary for the supported services. It
validates HTTP input, authenticates requests, propagates request context, and
maps calls to internal gRPC contracts.

## Upstreams

| Service       | Default address   | Gateway responsibility                             |
| ------------- | ----------------- | -------------------------------------------------- |
| Identity      | `127.0.0.1:50051` | User and authentication routes                     |
| Authorization | `127.0.0.1:50052` | Tenant permission checks and owner role assignment |
| Tenants       | `127.0.0.1:50053` | Tenant, membership, and driver routes              |

Notifications is intentionally not exposed as a public HTTP API. Identity calls
it through the internal Notifications contract.

## HTTP routes

All routes use the configurable `GATEWAY_PREFIX`, which defaults to
`/vite-ride`.

- `/users/*` maps account, authentication, verification, profile, and user
  administration operations to Identity.
- `/tenants/*` maps tenant lifecycle, membership, and driver operations to
  Tenants.

Tenant creation derives `ownerUserId` from the authenticated access token. After
Tenants creates the tenant and owner membership, the Gateway assigns the
`tenant-admin` policy role in Authorization.

Tenant-specific read and mutation routes use both `AccessAuthGuard` and
`AuthorizationGuard`. The permission guard sends the authenticated user,
tenant-domain identifier, resource, and action to Authorization before
forwarding the request.

## Request context

The Gateway creates or propagates `x-correlation-id` and forwards authenticated
user and tenant context as gRPC metadata. Clients may send `x-tenant-id`, while
routes containing `:tenantId` use the route value as the authorization domain.

Authentication payloads and tokens are not logged.

## Configuration

| Variable                 | Default           |
| ------------------------ | ----------------- |
| `GATEWAY_PORT`           | `3000`            |
| `GATEWAY_PREFIX`         | `vite-ride`       |
| `IDENTITY_GRPC_URL`      | `127.0.0.1:50051` |
| `AUTHORIZATION_GRPC_URL` | `127.0.0.1:50052` |
| `TENANTS_GRPC_URL`       | `127.0.0.1:50053` |

The shared JWT module also requires:

- `JWT_ACCESS_TOKEN_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRATION_TIME`
- `JWT_REFRESH_TOKEN_SECRET`
- `JWT_REFRESH_TOKEN_EXPIRATION_TIME`

Use independently generated runtime secrets. Do not commit them.

## Run and verify

Start the internal services before exercising HTTP routes:

```bash
npm run start:dev:notifications
npm run start:dev:authorization
npm run start:dev:tenants
npm run start:dev:identity
npm run start:dev:api-gateway
```

Focused checks:

```bash
npm run build:api-gateway
npm run test:unit -- --runTestsByPath apps/api-gateway/src/config/gateway.config.schema.spec.ts apps/api-gateway/src/authorization/authorization.guard.spec.ts apps/api-gateway/src/tenants/tenants.controller.spec.ts
```

## Structure

- `identity/` contains Identity HTTP routes, DTOs, mappers, and gRPC client.
- `authorization/` contains the policy client, permission decorator, and guard.
- `tenants/` contains protected Tenant routes, DTOs, and gRPC client.
- `grpc/` contains shared unary-client loading.
- `config/` validates public listener and upstream addresses.
