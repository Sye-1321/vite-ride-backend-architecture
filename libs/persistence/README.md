# Persistence Library

- Provides database connectivity, base persistence primitives, and generic repository implementations across the monorepo.
- Currently provides a **MongoDB** implementation; additional engines can be added following the same pattern.

---

## Purpose

`@app/persistence` defines **how persistence works across services**, not **what is persisted**.
---


## Design Approach

The persistence layer follows a **ports-and-adapters (hexagonal) architecture** across a microservices monorepo:

- Repository interfaces (ports) are defined in the **shared domain layer**
- This library provides **engine-specific infrastructure implementations**
- Each microservice:
  - Selects the persistence engine it needs
  - Imports the corresponding persistence module
  - Owns its schemas, mappers, and concrete repositories

This ensures consistency without enforcing shared data models.

---

## Structure

Persistence engines are organized by implementation:

persistence/
src/
persistent-entity.props.ts
mongodb/
mongo.module.ts
mongo-entity.base.ts
mongo.repository.ts


### MongoDB Engine

- **MongoModule**
  - Encapsulates MongoDB connection configuration
  - Imported explicitly by services that choose MongoDB

- **MongoEntity Base**
  - Provides common persistence concerns
  - Intended to be extended by service-owned schemas

- **MongoRepository**
  - Generic repository implementation
  - Implements domain repository ports
  - Uses mappers to isolate domain logic from persistence concerns

---

## Usage Model (Per Microservice)

Each microservice defines its own persistence layer by:

1. Importing the required persistence engine module (e.g. MongoModule)
2. Defining service-owned schemas extending the base persistence entity
3. Implementing mappers between domain aggregates and persistence models
4. Extending the base repository implementation as needed

Conceptual example:

user-service/
src/
user/
infra/
persistence/
user.schema.ts
user.mapper.ts
user.repository.ts


The persistence library provides the **shared infrastructure foundation**;  
each microservice owns its **data, mappings, and repository behavior**.

---

## Configuration

Database connections are configured **per microservice** via environment variables
and resolved using `ConfigService`.

The persistence library:
- Does **not** define environment variables
- Does **not** own deployment configuration
- Assumes each microservice provides its own configuration

---

## Guidelines

1. Do not place domain schemas or business logic in this library.
2. Repository implementations must satisfy ports defined in the domain layer.
3. Each microservice owns its persistence models and concrete repositories.
4. Database-specific logic must remain isolated within its engine directory.
5. New database engines must follow the same structural conventions.

---
## Notes

-This library is intentionally **open and extensible**.  

---
