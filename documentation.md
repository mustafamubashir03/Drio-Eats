# DRIO Eats — System Design & Architecture Documentation

## 1. Overview

DRIO Eats is a multi-role food delivery platform supporting four user experiences:
Customer, Restaurant Owner, Driver, and Admin/Superadmin. It consists of an Expo
(React Native) mobile client and a NestJS backend backed by Neon PostgreSQL via
Drizzle ORM. Authentication uses Better Auth (Bearer token + session cookie), with
a custom RBAC layer (roles, permissions, application lifecycle, audit logs).

## 2. Repository Structure

```
drio-eats/
├── apps/
│   ├── mobile-client/   # Expo app (src/app routes, src/components, src/lib, src/screens)
│   └── server/          # NestJS app (src/auth, src/rbac, src/db, src/main.ts)
├── packages/types/      # Shared TypeScript types/enums
├── documentation.md     # This file
└── README.md
```

## 3. Technology Stack

### Mobile
- Expo SDK 58, Expo Router 58, React 19.3, React Native 0.88, TypeScript 6
- State: React Context (AuthProvider) + React Query
- Storage: expo-secure-store (native), localStorage (web)
- Styling: existing DRIO Eats theme tokens + NativeWind/Tailwind config

### Backend
- NestJS 12, Node, TypeScript 6
- Database: Neon PostgreSQL via @neondatabase/serverless
- ORM: Drizzle ORM 1.0.0-rc.5 (drizzle-kit for migrations)
- Auth: Better Auth 1.7 + @thallesp/nestjs-better-auth 2.8 (Bearer + session)
- Validation: class-validator / class-transformer DTOs
- Observability: NestJS Observe (optional, via OBSERVE_* env)

### Shared
- @drio-eats/types (workspace package)

## 4. High-Level Architecture

```
┌─────────────────────┐       REST /api       ┌─────────────────────┐
│  Expo Mobile Client │ ────────────────────► │   NestJS API        │
│  (Expo Router)      │ ◄──────────────────── │   (port 3000)       │
└─────────────────────┘                       └──────────┬──────────┘
                                                         │
                                              ┌──────────┴──────────┐
                                              │  Neon PostgreSQL    │
                                              │  (Drizzle ORM)      │
                                              └─────────────────────┘
```

- Mobile communicates with backend via Axios (`apps/mobile-client/src/lib/axios.ts`).
- Base URL: in dev, resolved from Metro host URI; in prod, `EXPO_PUBLIC_API_URL`.
- Server listens on `0.0.0.0:3000` with global prefix `api`.

## 5. Authentication & Session Management

### Flow
1. User submits credentials to `POST /api/auth/sign-in/email`.
2. Better Auth creates session + returns Bearer token.
3. Mobile stores session in SecureStore/localStorage via `AuthProvider`.
4. Axios interceptor attaches `Authorization: Bearer <token>` to requests.
5. Protected requests resolve session via Better Auth `getSession` (cookie or Bearer).
6. Logout: `POST /api/auth/sign-out` (server invalidates session); client clears local state.

### Native vs Web
- Native (Expo Go) uses Bearer tokens; OS cookie jar may attach session cookie.
- Server middleware strips `Cookie` header from Bearer-authenticated requests to avoid
  Better Auth origin/CSRF rejection (native requests have no Origin header).
- Web uses cookie-based sessions with Origin validation against trustedOrigins.

### Session Restoration
- On app start, `AuthProvider` hydrates session from storage.
- Authorization (roles/permissions) loaded from `GET /api/rbac/me/roles`.

## 6. RBAC (Role-Based Access Control)

### Roles
CUSTOMER, DRIVER, RESTAURANT_OWNER, SUPERADMIN.

### Permissions
28 permission keys mapped to roles via `role_permissions` table.

### Application Lifecycle
- Driver/Restaurant Owner applications: NOT_APPLIED → PENDING → APPROVED/REJECTED → SUSPENDED/REINSTATED.
- RbacGuard checks account status and application approval status for role-gated routes.
- Suspending/rejecting revokes the operational role; reinstating restores it.

### Superadmin Bootstrap
- Idempotent service assigns all 4 roles to bootstrap user (mustafamubashir87@gmail.com).

### Guards & Decorators
- `RbacGuard` (global APP_GUARD) enforces auth, roles, permissions, ownership.
- Decorators: `@Roles`, `@Permissions`, `@OwnsRestaurant`, `@OwnsDelivery`, `@SuperAdmin`.
- Honors nestjs-better-auth `@Public()`/`@AllowAnonymous()` markers.

## 7. Mobile Navigation & Role Routing

- Expo Router file-based routing under `src/app/`.
- Root layout (`_layout.tsx`) wraps app with AuthProvider, ThemeProvider, QueryClientProvider.
- Role-based route guards redirect unauthenticated users to login.
- After login, `roleHome()` routes by primary role + application status:
  - Superadmin → `/(admin)/users`
  - Owner (approved) → `/(owner)`
  - Driver (approved) → `/(driver)`
  - else → `/(customer)`
- Bottom tabs per role:
  - Owner: Home, Orders, Menu, Analytics, Profile
  - Driver: Home, Active, History, Profile
  - Customer: Home, Search, Favorites, Orders, Profile

## 8. Database Schema (Key Entities)

Tables: users, accounts, sessions, verifications, jwks, addresses, restaurants, branches,
branch_menu_items, menu_categories, menu_items, orders, order_items, payments, payment_events,
refunds, deliveries, delivery_attempts, drivers, driver_branches, reviews, permissions,
user_roles, role_permissions, driver_applications, restaurant_owner_applications, audit_logs.

Migrations via `drizzle-kit` (`pnpm db:push/pull/studio`).

## 9. Design System

- Theme tokens in `src/lib/theme.tsx` (colors, spacing, typography, etc.).
- Shared components: `Screen`, `Text`, `Card`, `Badge`, `Button`, `Input`, `Avatar`, `Divider`.
- DRIO Eats visual identity preserved (Poppins fonts, lime accent, dark/light themes).
- Auth screens use `AuthScaffold` (hero image, tagline, form, CTA, footer link).

## 10. Key Screens

### Auth
- Login, Signup, Apply Driver, Apply Restaurant Owner.

### Customer
- Home, Search, Favorites, Orders, Profile, Order Details, Live Tracking.

### Owner
- Dashboard, Restaurants, Restaurant Detail, Menu, Orders, Analytics, Pending/Rejected/Suspended.

### Driver
- Dashboard, Deliveries, Active, History, Pending/Rejected/Suspended, Profile.

### Admin
- Users list/detail, Driver Applications, Owner Applications, RBAC Diagnostics.

## 11. API Endpoints (Selected)

- Public: `GET /api/health`, `GET /api/db-test`
- Auth: `/api/auth/*` (Better Auth: sign-in, sign-up, sign-out, session)
- Users: `GET /api/users/me`, `GET /api/users/profile`
- RBAC: `/api/rbac/me/roles`, driver/owner apply/status/applications, users, audit-logs

## 12. Development Setup

1. Install: `pnpm install`
2. Backend env: `apps/server/.env` (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, PORT)
3. Mobile env: `apps/mobile-client/.env` (EXPO_PUBLIC_API_URL)
4. DB migrate: `cd apps/server && pnpm db:push`
5. Start backend: `cd apps/server && pnpm start:dev`
6. Start mobile: `cd apps/mobile-client && pnpm start` (Expo Go) or `pnpm web`
7. Typecheck: `pnpm exec tsc --noEmit` (in each app)
8. Lint: `pnpm run lint`
9. Tests: `cd apps/server && pnpm test`
10. Mobile export: `pnpm exec expo export --platform web`

## 13. Testing & Verification

- Server: vitest unit + integration + acceptance tests (99 tests).
- Mobile: TypeScript + Expo lint + web export.
- Runtime verification of auth/role flows requires Expo Go/device.

## 14. Known Limitations

- Zod/Zustand/Redis declared in project rules but not implemented (class-validator + React Context used).
- Real-time/Socket.IO not implemented.
- Many business screens use static/mock data.
- Android runtime not verified in this environment.
- Some screens (owner restaurants, driver deliveries) use placeholder data.