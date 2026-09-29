This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## AI Tool Contract

`searchProducts`

The AI assistant uses the server-side `searchProducts` tool to search the Microchip Shop product catalog by product name, category, serial number, or description.

**Input schema**

```ts
{
  query: string;
}
```

## Architecture

A single Next.js (App Router) application — UI and server code deploy together — with clear layers inside it:

| Layer | Location | Notes |
| --- | --- | --- |
| UI | `src/app/**/page.tsx`, `src/components/` | Server Components by default; `"use client"` only where interactivity is needed. Never imports `src/lib/db.ts` or `src/lib/data/`. |
| Server API | `src/lib/auth/actions.ts` (Server Actions), `src/app/api/` (Route Handlers) | Validates input, enforces auth, orchestrates the layers below. No SQL. |
| Auth utilities | `src/lib/auth/` | `password.ts` (scrypt hashing), `session.ts` (session tokens and cookie), `guards.ts` (`requireUser` / `requireAdmin`) are server-only. `validation.ts` is pure and shared by forms and actions. |
| Database access | `src/lib/db.ts` (connection pool), `src/lib/data/` | All auth SQL lives here, using parameterized queries. |

Every server-side module imports `server-only`, so the build fails if one is accidentally pulled into a Client Component.

## Testing

```bash
npm test          # Vitest + React Testing Library (unit/component)
npm run test:e2e  # Playwright; builds and starts a production server on port 3100
```

E2E tests use the database from `.env.local` (local development only) and delete the `@e2e.microchip.test` users they create.
