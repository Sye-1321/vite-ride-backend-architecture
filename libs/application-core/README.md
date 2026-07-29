# Application Core Library

Reusable permission metadata and fail-closed HTTP authorization.

## Purpose

`@app/application-core` holds framework-facing application primitives that do
not belong to one service domain. It defines permission metadata, a decision
port, and a reusable HTTP guard.

## Boundaries

- May depend on Nest application abstractions.
- Must not contain service entities, persistence models, or provider secrets.
- A consuming application must bind `AUTHORIZATION_DECISION_PORT` to its
  authorization adapter.
- The guard denies missing authentication, explicit denial, and decision-port
  failure.
- The library does not know about gRPC, Casbin, or an application-specific
  client.

## Structure

- `decorators/` defines permission metadata.
- `guard/` contains the fail-closed HTTP guard.
- `ports/` defines the transport-independent decision contract.

## Importing

```ts
import {
  AUTHORIZATION_DECISION_PORT,
  AuthorizationGuard,
  RequirePermission,
} from '@app/application-core';
```

Bind the port to a concrete adapter in the consuming Nest module and register
`AuthorizationGuard` as a provider.
