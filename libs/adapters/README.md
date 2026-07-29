# Adapters Library

Reusable infrastructure implementations for shared application ports.

## Responsibilities

- Password hashing with bcrypt.
- Cryptographically secure numeric OTP generation.
- Opaque token generation.
- Structured JSON logging with recursive sensitive-field redaction.
- Global Nest provider bindings through `AdaptersModule`.

The library contains no service-specific business rules.

## Structured logging

`AppLoggerAdapter` implements both the shared `LoggerPort` and Nest's
`LoggerService`. Entries include an ISO timestamp, level, service, message, and
optional structured details. Passwords, tokens, credentials, phone numbers,
recipients, notification bodies, and related nested values are redacted before
serialization.

Applications can use one logger for Nest bootstrap and application logging:

```ts
const logger = new AppLoggerAdapter('api-gateway');
const app = await NestFactory.create(AppModule, { logger });
```

Application providers should inject `TYPES.LoggerPort` rather than instantiate
transport-specific loggers.

## Importing

```ts
import {
  AdaptersModule,
  AppLoggerAdapter,
  BcryptHasher,
  NumericOtpGenerator,
  RandomTokenGenerator,
} from '@app/adapters';
```

## Verification

```bash
npx jest --config jest.config.js --runInBand \
  --runTestsByPath libs/adapters/src/app-logger.adapter.spec.ts
```
