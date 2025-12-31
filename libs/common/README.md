# Common Library

- Shared cross-cutting utilities and infrastructure primitives used across the monorepo.  
- This package provides framework-level building blocks while remaining domain-agnostic.

---

## Purpose

`@app/common` centralizes reusable infrastructure components to ensure consistency and reduce duplication across microservices.

---

## Scope

- This library contains **technical utilities only**.  
- It must **not** include domain models, business rules, or service-specific logic.

---

## Structure

Organized by technical responsibility:

- **api/** – Shared API response formats  
- **decorators/** – Transport-level decorators  
- **exceptions/** – Transport-agnostic exception types  
- **guards/** – Passport-based authentication guards  
- **interceptors/** – Error-handling and global interceptors  
- **types/** – Framework-independent TypeScript utility types  

Each directory contains reusable, infrastructure-level code and must remain domain-free.

---

## Guidelines

1. Add only features that multiple micro-services can use.  
2. Do **not** introduce domain or business logic.  
3. Place files in the appropriate directory(or create new directory).  
4. Export all additions through the root `index.ts`.  

---

## Importing

Always import via the package root:

```ts
import {
  ApiErrorResponse,
  NotFoundException,
  GetCurrentUser,
} from '@app/common';

