**Intentional Limitations (Accepted Scope Decisions)**

The following limitations are **explicitly accepted and intentional** for the Tenant Service and represent deliberate scope decisions rather than architectural oversights, primarily driven by time constraints.

> All tenant membership operations require pre-existing global identities, which are referenced (e.g., by phone number), with invitation-based onboarding intentionally deferred due to time constraints.

> Driver profiles are stored per tenant and may be duplicated across tenants; this duplication is intentional to preserve tenant isolation and prevent cross-tenant data leakage

> Tenant operational configuration is intentionally excluded from this service due to time constraints, while all financial configuration is owned and managed by the Wallet & Settlement Service (WSS).

> Drivers cannot self-register and must be onboarded exclusively by tenant admins, aligning with established **office-based onboarding business rules**.




















1. Onboard Driver (Office-Based)

> Derived from: UC1 (Driver registration)

    - Create Driver (tenant-scoped)

    - Create TenantMember with role = DRIVER

    - Link existing userId from Identity Service

    - Enforce uniqueness per (tenantId, userId)


2. List Tenant Drivers

> Derived from: UC13 (List Drivers)

    - List drivers per tenant

    - Filter by Active / Suspended (membership status)


3. View Tenant Driver Detail

> Derived from: UC14 (View Driver Detail)

    - Return tenant-scoped driver record


4. Suspend Driver (Tenant-Scoped)

> Derived from: UC15 (Suspend User) — tenant-level variant

    - Suspend TenantMember (role = DRIVER)

    - Prevent access to tenant resources

    - Do not suspend global user account


5. List Tenant Members (Admins / Drivers)

    - List all members of a tenant

    - Support role-based filtering:

    - ADMIN

    - DRIVER
