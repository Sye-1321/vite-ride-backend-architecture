# Notifications service

The Notifications service owns outbound SMS and push delivery. Other services
call its internal gRPC contract instead of importing a provider SDK or handling
provider credentials themselves.

## Responsibilities

- Validate SMS and push delivery requests.
- Select a delivery adapter from environment configuration.
- Return an opaque delivery identifier and delivery status.
- Provide a gRPC health method.
- Keep recipient addresses, message content, device tokens, and credentials out
  of application logs.

The service does not own message templates, user preferences, or retry
scheduling. Those capabilities can be added behind the same transport and port
boundaries when they are required.

## Transport

The service implements `NotificationsService` from
`libs/proto-schema/proto/notifications.proto`.

| RPC        | Purpose                                                   |
| ---------- | --------------------------------------------------------- |
| `SendSms`  | Deliver one text message to one recipient.                |
| `SendPush` | Deliver one push notification to up to 500 device tokens. |
| `Health`   | Report the process as `SERVING`.                          |

The default bind address is `0.0.0.0:50054`.

## Configuration

Both channels use a `dry-run` driver by default. This makes local development
and automated checks runnable without external accounts or credentials.

| Variable                      | Default           | Required when                           |
| ----------------------------- | ----------------- | --------------------------------------- |
| `NOTIFICATIONS_GRPC_BIND_URL` | `0.0.0.0:50054`   | Never                                   |
| `SMS_DRIVER`                  | `dry-run`         | Use `afromessage` for live SMS delivery |
| `PUSH_DRIVER`                 | `dry-run`         | Use `firebase` for live push delivery   |
| `AFROMESSAGE_BASE_URL`        | Provider send URL | Never                                   |
| `AFROMESSAGE_API_TOKEN`       | None              | `SMS_DRIVER=afromessage`                |
| `FIREBASE_PROJECT_ID`         | None              | `PUSH_DRIVER=firebase`                  |
| `FIREBASE_CLIENT_EMAIL`       | None              | `PUSH_DRIVER=firebase`                  |
| `FIREBASE_PRIVATE_KEY`        | None              | `PUSH_DRIVER=firebase`                  |

Do not commit live credentials. Supply them through the runtime environment or a
secret manager.

## Run and verify

From the repository root:

```bash
npm run start:dev:notifications
npm run build:notifications
npm run test:unit -- --runTestsByPath apps/notifications-service/src/config/notifications.config.schema.spec.ts apps/notifications-service/src/sms/send-sms.usecase.spec.ts apps/notifications-service/src/push/send-push.usecase.spec.ts apps/notifications-service/src/delivery-redaction.spec.ts
```

With the default configuration, delivery requests are accepted and assigned an
opaque identifier but are not sent to an external provider. Logs contain only
the identifier, channel, and outcome.

## Structure

- `config/` validates startup configuration and conditional credentials.
- `sms/` contains the SMS use case and provider adapters.
- `push/` contains the push use case and provider adapters.
- `transports/` maps the shared gRPC contract to application use cases.

Provider-specific code stays behind `SmsPort` and `PushPort`, keeping transport
and application logic independent of third-party SDKs.
