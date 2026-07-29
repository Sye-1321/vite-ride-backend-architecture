# Audit Library

Shared audit value objects, factories, and persistence mapping.

## Purpose

`@app/audit` gives domain aggregates a consistent representation of creation,
update, deletion, and soft-delete metadata.

## Exports

- `Audit` validates and carries audit values.
- `AuditFactory` creates audit state for create, update, and delete operations.
- `AuditMapper` converts between domain values and persistence fields.
- `IAudit` defines the serializable shape.

## Boundaries

- Audit values are domain metadata, not an authorization mechanism.
- Callers supply the actor identifier; this library does not read request
  context.
- Do not place tokens, credentials, or request payloads in audit fields.
- Service repositories remain responsible for persisting audit data.

## Importing

```ts
import { AuditFactory, AuditMapper } from '@app/audit';
```
