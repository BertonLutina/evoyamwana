# Architecture

EVOYAMWANA is organized as an npm-workspaces monorepo.

- `apps/web` owns the browser experience and communicates with the API through service modules.
- `apps/api` owns REST routes, middleware, services, Prisma access, and authentication.
- `packages/shared` contains shared DTOs, route constants, and domain types that are safe to use on both client and server.

The API keeps HTTP concerns in controllers, business logic in services, and database access behind Prisma. Frontend pages are routed through React Router and wrapped by layout components.
