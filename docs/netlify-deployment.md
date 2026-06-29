# Netlify Deployment

EVOYAMWANA can deploy the web app and Express API on Netlify.

Production architecture:

```text
Netlify web app
  /api/* redirect
Netlify Function
  Express API
Prisma
External PostgreSQL database
```

## Important

Netlify does not provide a PostgreSQL database inside this project. Use an external PostgreSQL provider such as Neon, Supabase, Railway, Render, or another managed PostgreSQL service.

The frontend and mobile app never connect directly to PostgreSQL. They call the API.

## Files

- `netlify.toml` configures the Netlify build, functions, and redirects.
- `netlify/functions/api.ts` wraps the Express app as a Netlify Function.

## Netlify Build Settings

If Netlify reads `netlify.toml`, these are already configured:

```text
Build command:
npm run prisma:generate && npm run build --workspace @evoyamwana/shared && npm run build --workspace @evoyamwana/api && npm run build --workspace @evoyamwana/web

Publish directory:
apps/web/dist

Functions directory:
netlify/functions
```

## Environment Variables

Set these in Netlify:

```env
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
JWT_SECRET=use_a_long_random_secret_at_least_24_chars
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://your-site-name.netlify.app
VITE_API_URL=/api
```

For deploy previews, you can allow multiple origins:

```env
CORS_ORIGIN=https://your-site-name.netlify.app,https://deploy-preview-1--your-site-name.netlify.app
```

## Database Migration

Run migrations against your production PostgreSQL database before using the app:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public" npm run prisma:migrate
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public" npm run prisma:seed
```

For a real production school, only seed demo data if you actually want demo users.

## API URLs

On Netlify, the web app should call:

```text
/api
```

Examples:

```text
/api/health
/api/auth/login
/api/students
```

For mobile production builds, set:

```env
EXPO_PUBLIC_API_URL=https://your-site-name.netlify.app/api
```

## Notes

- React Router is supported by the final `/* -> /index.html` redirect.
- API requests are handled first by `/api/* -> /.netlify/functions/api/:splat`.
- Keep secrets in Netlify environment variables, not in committed files.
