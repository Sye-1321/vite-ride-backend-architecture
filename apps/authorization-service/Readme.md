# Authorization service

The Authorization service owns access checks and tenant-scoped role
assignments. It exposes an internal gRPC API and evaluates policies with Casbin.

## Responsibilities

- Check whether a user can perform an action on a resource.
- Assign, remove, and list tenant-scoped roles.
- Load the service's static resource policies at startup.
- Keep policy-engine and persistence details behind application ports.
- Provide a gRPC health method.

Authentication and token issuance remain in Identity. Tenant lifecycle data
remains in Tenants.

## Transport

The service implements `AuthorizationService` from
`libs/proto-schema/proto/authorization.proto`.

| RPC           | Purpose                                              |
| ------------- | ---------------------------------------------------- |
| `CheckAccess` | Evaluate a user, domain, resource, and action tuple. |
| `AssignRole`  | Add a role to a user within one domain.              |
| `RemoveRole`  | Remove a role from a user within one domain.         |
| `GetRoles`    | List a user's roles within one domain.               |
| `Health`      | Report the process as `SERVING`.                     |

The default bind address is `0.0.0.0:50052`.

## Policy model

Role membership keys use the form `<domain>::<userId>`. This prevents a role
assigned in one tenant domain from authorizing the same user in another domain.
Static resource permissions are defined in
`src/application/interfaces/define-static-policies.ts`, while the Casbin model
is in `src/engines/casbin/rbac_model.conf`.

Role assignment and removal are idempotent. The `changed` response field tells a
caller whether that request changed the stored policy.

## Configuration

MongoDB persistence is mandatory. The service fails configuration validation
when its database URL or database name is absent. Static policies are loaded
idempotently at startup.

| Variable                      | Default            | Required |
| ----------------------------- | ------------------ | -------- |
| `AUTHORIZATION_GRPC_BIND_URL` | `0.0.0.0:50052`    | No       |
| `CASBIN_MODEL_PATH`           | Service model path | No       |
| `CASBIN_COLLECTION`           | `casbin`           | No       |
| `DATABASE_URL_AUTHZ`          | None               | Yes      |
| `DATABASE_NAME_AUTHZ`         | None               | Yes      |

Do not commit database credentials. Supply them through the runtime environment
or a secret manager.

## Run and verify

From the repository root:

```bash
npm run start:dev:authorization
npm run build:authorization
npm run test:unit -- --runTestsByPath apps/authorization-service/src/config/authorization.config.schema.spec.ts apps/authorization-service/src/application/services/authorization.services.spec.ts
npm run test:integration -- --runTestsByPath apps/authorization-service/src/authorization.integration-spec.ts
```

## Structure

- `application/` defines transport-independent DTOs, ports, services, and static
  policies.
- `engines/casbin/` implements those ports using Casbin.
- `transports/grpc/` maps the shared protobuf contract to application services.
- `config/` validates network and policy-store settings.
