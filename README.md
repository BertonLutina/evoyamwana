# EVOYAMWANA

EVOYAMWANA is a modern African school management platform built as a TypeScript-first full-stack SaaS monorepo.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL, Prisma ORM
- Authentication: JWT, bcrypt
- Monorepo: npm workspaces

## Project Structure

```text
evoyamwana/
  apps/
    web/       React Vite application
    api/       Express REST API
    mobile/    Expo React Native application
  packages/
    shared/    Shared types and constants
  docs/        Product and engineering docs
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

For API-only development with hot reload, you can also run `npm run dev:watch --workspace @evoyamwana/api` in environments that allow `tsx` file watching.

Frontend: http://localhost:5173  
Backend: http://localhost:4000  
Health check: http://localhost:4000/health

Mobile:

```bash
npm run dev:mobile
```

The Expo app uses `EXPO_PUBLIC_API_URL` and calls the same Express API as the web app. It has no database of its own.

## Environment

Update `apps/api/.env` with your PostgreSQL connection string and JWT secret before running migrations.

## Useful Scripts

```bash
npm run dev:web
npm run dev:api
npm run dev:mobile
npm run build
npm run lint
npm run typecheck
```

## Deployment

Netlify deployment is configured in `netlify.toml`.

- Web deploy output: `apps/web/dist`
- API deploy target: Netlify Function at `/api/*`
- Database: external PostgreSQL through `DATABASE_URL`

See [docs/netlify-deployment.md](docs/netlify-deployment.md).

## API Routes

- `GET /health` - API health status
- `POST /auth/register-school` - create a school and school admin account
- `POST /auth/login` - authenticate a user and receive a JWT
- `GET /auth/me` - return the authenticated user from a bearer token
- `POST /auth/logout` - stateless logout response; clients discard the token
