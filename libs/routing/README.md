# Routing Library

Shared geocoding, autocomplete, and route-metric boundary.

## Purpose

`@app/routing` exposes `RoutingServicePort` and a default implementation backed
by Nominatim for address search and OSRM for route calculation.

## Capabilities

- Convert an address to coordinates.
- Return address suggestions.
- Calculate route distance and estimated duration.
- Map provider responses to domain-owned routing types.

## Boundaries

- Applications own trip, pricing, and dispatch decisions.
- Provider HTTP clients stay in `infrastructure/`.
- Coordinates and route metrics stay independent from transport DTOs.
- Production callers should add provider-appropriate timeout, retry, cache, and
  usage-policy controls.

## Importing

```ts
import { RoutingModule, RoutingServicePort } from '@app/routing';
```
