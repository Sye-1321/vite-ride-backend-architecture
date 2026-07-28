# Application Core Library

Reusable application-layer decorators and guard scaffolding.

## Purpose

`@app/application-core` holds framework-facing application primitives that do
not belong to one service domain. The current contents define permission
metadata and an authorization-guard scaffold.

## Boundaries

- May depend on Nest application abstractions.
- Must not contain service entities, persistence models, or provider secrets.
- A service must connect authorization decisions to its own transport client.
- The API Gateway currently owns the active gRPC-backed permission guard.

The guard in this package is not registered by the supported applications. Do
not use it as an authorization boundary until it is connected to a real
decision port and covered by denial tests.

## Structure

- `decorators/` defines permission metadata.
- `guard/` contains the reusable guard scaffold.

## Importing

Export additions from `src/index.ts` before importing them through
`@app/application-core`.
