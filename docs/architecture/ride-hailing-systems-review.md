# Ride-Hailing Systems Architecture Review

> **Document type:** Engineering research and decision record
>
> **Purpose:** Capture the evaluation method and architectural lessons that
> informed the Vite Ride backend
>
> **Implementation status:** Research input, not an implementation-coverage
> claim

## 1. Why this review was conducted

Before defining the Vite Ride backend, existing public ride-hailing projects
were reviewed to understand which design choices repeatedly worked, which
failed under concurrency, and which patterns were appropriate to adopt or
adapt.

The review was intentionally stricter than a feature checklist. A repository
could expose registration, booking, driver assignment, and WebSockets while
still failing the core correctness problems of a ride-hailing system. The
analysis therefore treated lifecycle integrity, concurrency, and ownership of
state as primary evaluation gates.

The resulting decisions influenced the original private backend. This document
records that reasoning; it does not imply that ride lifecycle, matching, or
pricing code is included in the sanitized public edition.

## 2. Evaluation framework

### 2.1 Classify the system first

Each project was classified before its implementation details were compared:

- Was it a learning prototype, a demonstration, or a production-oriented
  system?
- What users, operating environment, and scale did it assume?
- Was it optimized primarily for delivery speed, simplicity, or correctness?
- Did it solve the same operational class of problem as Vite Ride?

This prevents a small educational project from being criticized for not solving
problems outside its scope while also preventing a feature-rich demonstration
from being mistaken for a production architecture.

### 2.2 Examine the domain model

The review then inspected how real-world concepts were represented:

- User, rider, driver, vehicle, ride request, ride, and payment boundaries
- One-to-many and many-to-many relationships
- Ride lifecycle states and allowed transitions
- Domain validation versus controller or service validation
- Enums versus unvalidated strings
- Protection of invariants inside aggregates and value objects

The central question was whether the model expressed business rules or merely
stored data.

### 2.3 Apply the ride-lifecycle gate

Ride lifecycle integrity was treated as non-negotiable. The review asked:

- Is there one source of truth for ride state?
- Are legal and illegal transitions explicit?
- Is transition enforcement centralized?
- Are transitions atomic?
- What prevents two drivers from accepting the same ride?
- What happens when acceptance races with cancellation?
- Can commands be retried safely?
- Is there an idempotency or deduplication strategy?

A repository that could not answer these questions was treated as educational,
regardless of how many endpoints or screens it contained.

### 2.4 Review realtime behavior

WebSockets were not treated as proof of reliable realtime design. The review
looked for:

- Separation between durable state and transient delivery
- Location-update throttling or debouncing
- Ordering and stale-update protection
- Backpressure and disconnection handling
- Retry, reconciliation, and recovery behavior
- Isolation of realtime infrastructure from domain decisions

The guiding rule was that realtime delivery improves responsiveness, while
persistence remains the authority for correctness.

### 2.5 Review matching, routing, and pricing

The comparison examined:

- Driver selection and reservation semantics
- Distance and ETA calculation
- External routing engines versus embedded geospatial logic
- Testability of routing adapters
- Pricing strategies and configuration boundaries
- Surge or policy selection
- Request-time versus ride-time price determination

Strategies were evaluated separately from policies: strategies define how a
calculation works, while policies determine when a strategy applies.

## 3. Recurring weaknesses

### 3.1 Status enums without state machines

Many projects declared states such as `REQUESTED`, `ACCEPTED`, `ONGOING`, and
`COMPLETED` but did not encode allowed transitions. Controllers or services
assigned status values directly, which made lifecycle rules optional.

**Lesson:** An enum names states; it does not enforce behavior. Lifecycle rules
belong in a domain authority that can reject invalid transitions.

### 3.2 Scattered lifecycle logic

Ride behavior was often distributed across controllers, services, and models.
No single component could explain why a transition was valid.

**Lesson:** Lifecycle enforcement should be centralized around the ride
aggregate or a narrowly defined application workflow.

### 3.3 Matching treated as a query

The common matching algorithm selected the nearest available driver and
returned the result without reserving that driver. This was non-atomic,
stateless, and vulnerable to two simultaneous assignments.

**Lesson:** Matching is resource allocation. Selection and reservation must be
treated as one correctness boundary.

### 3.4 Hard-coded pricing

Base fares, distance rates, time rates, and surge multipliers were frequently
embedded directly in application code.

**Lesson:** Keep calculation strategies in code, but make approved pricing
parameters and policy selection configurable and auditable.

### 3.5 Missing concurrency controls

Optimistic versioning, conditional updates, idempotency keys, and explicit
conflict handling were generally absent.

**Lesson:** Correctness cannot rely on requests arriving one at a time. Each
critical command needs a defined concurrency and retry policy.

## 4. Common failure modes

### 4.1 Multiple sources of truth

Several designs duplicated operational state across fields such as:

- `Ride.status`
- `Driver.currentRide`
- `User.currentRide`
- `Driver.isAvailable`

These values can diverge after partial failures or concurrent writes.

**Decision:** Store authoritative state once and derive secondary views where
possible.

### 4.2 Anemic domain models

Entities often exposed public setters while services contained all business
rules. Correctness then depended on every caller remembering every rule.

**Decision:** Domain objects should protect their invariants; application
services should coordinate rather than redefine those rules.

### 4.3 Non-atomic lifecycle transitions

A typical workflow updated the ride, updated the driver, and sent a
notification sequentially. Failure after any intermediate step left the system
inconsistent.

**Decision:** Commit authoritative state atomically. Trigger external side
effects afterward through a reliable delivery mechanism such as an outbox.

### 4.4 Realtime events treated as truth

Some projects behaved as though successful socket delivery completed the
business operation.

**Decision:** Events and sockets communicate changes; durable state determines
what is true. Lost events should degrade freshness, not corrupt the lifecycle.

### 4.5 Overloaded services

Matching, pricing, persistence, and notifications were frequently combined in
one application service.

**Decision:** Give each service a bounded responsibility and make cross-service
effects explicit.

## 5. Patterns worth retaining

### 5.1 Strategy boundaries

Matching and fare calculations benefit from strategy interfaces because
implementations become replaceable and independently testable. Strategy
selection should be policy-driven rather than buried in conditional code.

### 5.2 External routing infrastructure

Routing, geocoding, and road-network computation are infrastructure concerns.
The domain should define ports for distance, routes, and ETA while adapters
integrate with systems such as OSRM, Valhalla, GraphHopper, Nominatim, or an
approved commercial provider.

### 5.3 WebSockets for experience, not authority

Sockets are appropriate for location updates, assignment notifications, and UI
freshness. They should not replace persistent command handling or
reconciliation.

### 5.4 Separate intent from commitment

Separating `RideRequest` from `Ride` makes an important distinction:

- A ride request expresses reversible intent.
- A ride represents a controlled commitment after assignment.

This boundary simplifies cancellation, matching, expiration, and auditability.

## 6. Adopt, adapt, and avoid

| Decision | Pattern                              | Application to Vite Ride                                                    |
| -------- | ------------------------------------ | --------------------------------------------------------------------------- |
| Adopt    | Matching and pricing strategies      | Keep algorithms replaceable and testable                                    |
| Adopt    | Ride request separated from ride     | Distinguish intent from commitment                                          |
| Adopt    | External routing adapters            | Keep geospatial providers outside the domain                                |
| Adopt    | WebSockets for delivery              | Preserve persistence as the source of truth                                 |
| Adapt    | Explicit ride state machine          | Use a focused transition model rather than a workflow engine                |
| Adapt    | Single source of truth               | Let the ride aggregate own lifecycle state                                  |
| Adapt    | Matching as reservation              | Use conditional reservation with expiry and clear ownership                 |
| Adapt    | Configurable pricing                 | Configure approved parameters without building an unrestricted rules engine |
| Avoid    | Full event sourcing by default       | Added operational cost was not justified for the initial scope              |
| Avoid    | Distributed transactions             | Prefer local transactions and reliable asynchronous effects                 |
| Avoid    | Complex saga orchestration too early | Introduce only when workflows demonstrate the need                          |
| Avoid    | Over-modeled location streams        | Keep realtime data structures proportional to actual guarantees             |

## 7. Correctness questions carried into design

The review produced a permanent set of design questions:

1. What prevents two drivers from accepting the same request?
2. How is an accept-versus-cancel race resolved?
3. Which component owns the lifecycle transition?
4. Can every client command be retried without duplicate effects?
5. How is a reserved driver released after timeout or failure?
6. Can the system explain why a ride reached its current state?
7. Which data is durable truth, and which is a projection or notification?
8. How are external side effects recovered after local state commits?

These questions are more useful than counting endpoints because they expose the
system's actual safety properties.

## 8. Relationship to the public edition

The sanitized public repository concentrates on API boundaries, identity,
authorization, partial tenancy, partial notifications, shared infrastructure,
and verification. Dispatch, matching, trip lifecycle, fare calculation, and
payment implementations remain private.

Accordingly, this review demonstrates the engineering process that informed
the complete backend. It must not be read as evidence that the omitted ride
operations are implemented in the public source tree.
