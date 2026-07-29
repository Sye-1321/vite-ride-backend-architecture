# Shared Kernel Library

Framework-light domain and application primitives shared by the services.

## Purpose

`@app/shared-kernel` standardizes aggregates, entities, value objects, commands,
queries, domain events, repository ports, mappers, and dependency-injection
tokens.

## Structure

- `domain/aggregate`, `entity`, and `value-objects` provide base domain types.
- `domain/commands`, `queries`, and `events` provide message primitives.
- `domain/ports` defines reusable technology-independent contracts.
- `di-tokens` contains stable Nest injection tokens.
- `mapper` and `utils` contain small shared mapping helpers.

## Dependency rules

- Domain code may depend on this library.
- The shared kernel must not import application source, provider SDKs, database
  models, or protobuf contracts.
- Service-specific ports belong with the service unless they are genuinely
  reusable.
- Adding a dependency-injection token does not move ownership of its interface
  into this library.

## Importing

```ts
import { AggregateRoot, RepositoryPort, TYPES, ValueObject } from '@app/shared-kernel';
```
