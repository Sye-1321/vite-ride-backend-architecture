# Context Library

Request-context propagation for HTTP gateways and gRPC services.

## Purpose

`@app/context` creates a correlation identifier, exposes request metadata
through an accessor, and forwards approved context fields over gRPC metadata.

## Modules

- `GatewayContextModule` initializes CLS for HTTP requests and registers the
  gateway interceptor.
- `MicroserviceContextModule` reads incoming gRPC metadata.
- `GrpcClientContextInterceptor` forwards correlation, user, and tenant
  context to internal calls.

## Boundaries

- Context is request metadata, not proof of authorization.
- Services must still authenticate callers and enforce policies.
- Do not add tokens, passwords, one-time codes, or provider credentials.
- Logging should use opaque correlation identifiers, not personal data.

## Importing

```ts
import {
  GatewayContextModule,
  MicroserviceContextModule,
  RequestContextAccessor,
} from '@app/context';
```
