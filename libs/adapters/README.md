# Adapters Library

- Shared infrastructure adapter implementations used across the monorepo.
- Provides concrete implementations for domain ports while keeping the domain layer isolated.

---

## Purpose

`@app/adapters` centralizes reusable **port implementations** to ensure consistency and avoid duplication across microservices.

---

## Scope

Adapters in this library:

- Implement ports defined in the shared kernel
- Are stateless, lightweight, and easily replaceable

This library must not contain business logic or domain decisions.

---

## Structure

Organized by implementation responsibility:

- `*-hasher.adapter.ts` – Hashing implementations
- `*-otp-generator.adapter.ts` – OTP generation strategies
- `*-token-generator.adapter.ts` – Token generation implementations
- `*-logger.adapter.ts` – Logging adapters

Each adapter implements **one domain port** and remains domain-agnostic.

---

## Guidelines

1. Implement ports from `shared-kernel/domain/ports`.
2. Do not introduce business logic or validation.
3. Do not define NestJS modules or provider bindings.
4. Export all adapters through the root `index.ts`.

---

## Importing

Always import via the package root:

```ts
import { BcryptHasher, NumericOtpGenerator, RandomTokenGenerator } from '@app/adapters';
```
