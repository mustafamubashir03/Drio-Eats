# DRIO Eats

DRIO Eats is a multi-role food delivery platform with four user experiences: Customer,
Restaurant Owner, Driver, and Admin/Superadmin. It consists of an Expo (React Native)
mobile client and a NestJS backend using Neon PostgreSQL via Drizzle ORM, with Better
Auth for authentication and a custom RBAC layer.

## Tech Stack

- Mobile: Expo SDK 58, Expo Router 58, React 19.3, React Native 0.88, TypeScript 6
- Backend: NestJS 12, Node, TypeScript 6, Drizzle ORM 1.0.0-rc.5, Neon serverless driver
- Auth: Better Auth 1.7 + @thallesp/nestjs-better-auth 2.8 (Bearer + session)
- Validation: class-validator / class-transformer (DTOs)
- DB: Neon PostgreSQL
- Shared: `@drio-eats/types`

## Repository Structure

```
drio-eats/
├── apps/
│   ├── mobile-client/   # Expo app (src/app routes, src/components, src/lib, src/screens)
│   └── server/          # NestJS app (src/auth, src/rbac, src/db)
├── packages/types/      # Shared TypeScript types/enums
├── documentation.md     # Full system design & architecture
└── README.md
```

## Architecture

```
Mobile (Expo)  --REST /api-->  NestJS API  -->  Neon PostgreSQL
                                    |
                                    +--> Better Auth (session/Bearer)
```

## Development Setup

1. Install: `pnpm install`
2. Backend env: `apps/server/.env`
3. Mobile env: `apps/mobile-client/.env`
4. DB migrate: `cd apps/server && pnpm db:push`
5. Start backend: `cd apps/server && pnpm start:dev`
6. Start mobile: `cd apps/mobile-client && pnpm start`

## Verification

- Server tests: `cd apps/server && pnpm test`
- Typecheck: `pnpm exec tsc --noEmit` (in each app)
- Lint: `pnpm run lint`
- Mobile export: `pnpm exec expo export --platform web`

## Documentation

See `documentation.md` for the complete system design, RBAC, navigation, and API details.

## Known Limitations

- Zod/Zustand/Redis declared in project rules but not implemented.
- Real-time/Socket.IO not implemented.
- Many business screens use static/mock data.
- Android runtime not verified in this environment.