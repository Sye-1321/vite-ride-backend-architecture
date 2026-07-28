# Proto Schema Library

Shared gRPC contracts for communication between the supported applications.
The `.proto` files are the transport source of truth; TypeScript declarations
provide compile-time request and response types to service implementations and
clients.

## Purpose

- Define stable internal service package, message, enum, and RPC names.
- Keep transport contracts independent from application and domain code.
- Detect accidental RPC-surface drift with focused contract tests.

This library does not contain business rules, persistence code, credentials, or
service implementations.

## Contracts

| File                        | Package         | Service                |
| --------------------------- | --------------- | ---------------------- |
| `proto/identity.proto`      | `identity`      | `UserService`          |
| `proto/authorization.proto` | `authorization` | `AuthorizationService` |
| `proto/tenants.proto`       | `tenants`       | `TenantsService`       |
| `proto/notifications.proto` | `notifications` | `NotificationsService` |

## Importing

Use the library entry point rather than importing another application's types:

```ts
import { AccessCheckRequest, AUTHORIZATION_SERVICE_NAME } from '@app/proto-schema';
```

## Dependency rules

- Applications may import this library.
- This library must not import application source.
- Domain entities must not depend on protobuf request or response types.
- Mapping between transport and domain values belongs at each application's
  transport boundary.

## Verification

Run the focused contract test:

```bash
npm run test:unit -- libs/proto-schema/src/core-contracts.spec.ts
```

The test verifies checked-in package names, service names, and RPC lists.

## Security

Contracts contain field shapes only. Do not add credentials, internal hosts,
provider secrets, production data, or confidential policy definitions.

## Limitations

The protobuf definitions describe the internal synchronous boundary. Delivery
guarantees, retries, authorization semantics, and distributed consistency are
implemented and documented by the owning applications.
