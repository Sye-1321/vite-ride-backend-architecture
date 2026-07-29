# Tenants service

The Tenants service owns tenant lifecycle, tenant memberships, and
tenant-scoped driver profiles. It exposes an internal gRPC API and persists its
owned records in MongoDB.

## Responsibilities

- Create, retrieve, list, rename, activate, deactivate, and suspend tenants.
- Create the first administrator membership when a tenant is created.
- Add, suspend, remove, and list tenant members.
- Register a driver profile together with its driver membership.
- Enforce tenant-scoped uniqueness for memberships and driver profiles.
- Provide a gRPC health method.

Global user identities remain in Identity. Role-policy evaluation remains in
Authorization.

## Transport

The service implements `TenantsService` from
`libs/proto-schema/proto/tenants.proto`.

| Area             | RPCs                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| Tenant lifecycle | `CreateTenant`, `GetTenant`, `ListTenants`, `UpdateTenant`, `ChangeTenantStatus` |
| Membership       | `AddMember`, `SuspendMember`, `RemoveMember`, `ListMembers`                      |
| Drivers          | `RegisterDriver`, `GetDriver`                                                    |
| Operations       | `Health`                                                                         |

The default bind address is `0.0.0.0:50053`. List calls default to page 1 with
20 records and cap the requested page size at 100.

## Storage

MongoDB persistence is mandatory. The service fails configuration validation
when `DATABASE_URL_TENANTS` is absent. Repositories use the named
`TenantsConnection`, soft-delete removed members, and ignore those records in
membership reads.

| Variable                | Default         | Required |
| ----------------------- | --------------- | -------- |
| `TENANTS_GRPC_BIND_URL` | `0.0.0.0:50053` | No       |
| `DATABASE_URL_TENANTS`  | None            | Yes      |

Do not commit database credentials. Supply them through the runtime environment
or a secret manager.

## Lifecycle rules

- Tenant names are checked before creation; the MongoDB schema also carries a
  unique index.
- Creating a tenant also creates an active `ADMIN` membership for
  `ownerUserId`.
- A suspended tenant cannot be reactivated through the current lifecycle rule.
- Registering a driver creates the `DRIVER` membership when it does not already
  exist.
- Removing a member does not delete the global user identity.
- Driver profiles are tenant-scoped and may exist for the same global user in
  multiple tenants.

## Run and verify

From the repository root:

```bash
npm run start:dev:tenants
npm run build:tenants
npm run test:unit -- --runTestsByPath apps/tenants-service/src/config/tenants.config.schema.spec.ts
npm run test:integration -- --runTestsByPath apps/tenants-service/src/tenants.integration-spec.ts
```

## Structure

- `application/` coordinates tenant, membership, and driver use cases.
- `tenants/`, `membership/`, and `drivers/` contain the respective domain and
  Mongo persistence code.
- `transports/` maps the shared protobuf contract to application operations.
- `config/` validates network and persistence settings.
