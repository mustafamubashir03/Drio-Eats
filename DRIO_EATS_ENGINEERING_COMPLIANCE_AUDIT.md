# DRIO Eats — Engineering Compliance Audit (READ-ONLY)

Generated: 2026-11-06 (audit only; no source changes made)

## 1. Executive summary

- **Overall:** The codebase is a working monorepo (Expo SDK 58 mobile + NestJS 12 server + Drizzle/Neon) with a coherent RBAC/auth design and a clear theme. It passes TypeScript (`tsc --noEmit` exit 0) for both apps. However, several **High** issues exist: compiled `.js` files shadowing `.ts` source (breaks tests and caused Expo Router duplicate-route conflicts), an **unrestricted CORS** (`app.enableCors()` with no options), a **hardcoded fallback Better Auth secret**, and an **overly broad trusted-origin wildcard**. Validation is implemented with `class-validator`, not the documented Zod stack. Zustand and Redis are declared in project rules but are **not used** anywhere in the codebase. Shared types (`@drio-eats/types`) are stale (`DELIVER` vs `DRIVER`, singular `role` vs RBAC roles). Design drift exists (hardcoded hex values outside the theme in screens/components).
- No database migrations, seeds, dependency changes, or source edits were performed during this audit.

## 2. Actual technology and version baseline

### Mobile (`apps/mobile-client`)
- Expo `58.0.23`, Expo Router `58.0.30`, React `19.3.0`, React Native `0.88.1`
- RN Reanimated `4.7.1`, Gesture Handler `~3.3.0`, Safe Area Context `5.11.1`, Screens `~4.30.1`, Worklets `0.13.0`
- TypeScript `~6.0.3`, NativeWind `4.2.7`, TanStack Query `^5.105.0`, Axios `^1.21.0`
- No `zustand` dependency; no `@react-navigation/*` direct imports (uses expo-router)

### Backend (`apps/server`)
- NestJS `^12.0.1` core/platform/config/testing, Node types `^24`, TS `^6.0.2`
- Drizzle ORM `1.0.0-rc.5`, `@neondatabase/serverless ^1.2.0`
- Better Auth `^1.7.15`, `@thallesp/nestjs-better-auth 2.8.0`, `@better-auth/drizzle-adapter ^1.7.15`
- Validation: `class-validator ^0.15.1` + `class-transformer ^0.5.1` (NO `zod` dependency)
- No Redis client, no Socket.IO, no Zustand (backend N/A)
- Vitest `4.1.2`, oxlint `^1.58.0`

### Shared
- `@drio-eats/types` (private, `index.ts`): `UserRole` enum uses `DELIVER` (should be `DRIVER`); `User.role: UserRole` (singular) conflicts with RBAC multi-role model.

## 3. Skills loaded and guidance applied
- Loaded: `expo-overview`, `expo-native-ui`, `expo-design-system`, `expo-animation` (discoverable under `.claude/skills`).
- `expo-router` named skill was **not available**; used official Expo Router 58 docs + installed package APIs instead (per instructions, not repeatedly attempted).
- `nestjs-best-practices` skill was **not available** in `.claude/skills`; NestJS audit performed against official NestJS 12 docs, installed types, and existing patterns. Noted as unavailable.

## 4. Expo SDK compliance
- **Compliant with observations.** Expo 58 + Router 58 usage is version-appropriate; `app.json` uses `expo-router` plugin, `typedRoutes`, SDK 58 packages. `metro.config.js` default; `babel.config.js` uses `babel-preset-expo` (correct for Expo; worklets plugin auto-configured).
- Findings: legacy `.js` compiled files in `src/app` caused duplicate route conflicts (resolved earlier by removing 51 `.js` siblings; current scan shows 0 duplicate route pairs). `predictiveBackGestureEnabled: false` on Android (minor).

## 5. React Native compliance
- **Compliant with observations.** Uses `react-native-safe-area-context` (not RN SafeAreaView) in `Screen`/`AuthScaffold`. Lists use `FlatList` inside `ScrollView` in some screens (e.g. `users.tsx` lines 55-127) — potential nested scroll/view nesting (Medium). No `PanResponder`; gesture handler available but not heavily used.

## 6. Expo Router and navigation assessment
- **Compliant with observations.** Root `_layout.tsx` uses `Stack` (not replaced with `Tabs`), role groups, `Slot`, redirects via `router.replace`, `usePathname`/`useSegments`. Role layouts enforce RBAC + status routes. Shared routes (`order-details`, `live-tracking`) registered in root Stack.
- Finding: `BottomTabs` active detection previously used pathname includes (fixed to `useSegments()`). Current implementation uses `router.replace` for tab presses (acceptable). `router.push` used for detail routes (fine).
- Potential: `customer/_layout.tsx` redirects approved owner/driver to their shells; okay.

## 7. Existing design-system integrity assessment
- **Needs attention.** Theme tokens centralized in `lib/theme.tsx` (DARK_COLORS/LIGHT_COLORS, spacing not tokenized). Hardcoded hex values outside theme in screens/components (e.g. `app/(driver)/active.tsx`? border colors `"#3A3A3A"` in owner index; `live-tracking.tsx` line 58; `apply-driver.tsx` lines 216-217). `StyleSheet.create` used widely (skill prefers inline; not a defect per se).
- Design preserved: no theme replacement performed. Shared components (`Screen`, `Card`, `Button`, `Badge`, `Text`, `Input`, `Avatar`, `Divider`) reused. `Text` variants defined. Spacing mostly inline numbers (16/20/12) not tokenized — observation.

## 8. NestJS compliance
- **Compliant with observations.** NestJS 12 modular structure, DI, guards, decorators, `ConfigModule`, global prefix `api`. `strict: true` (except `strictPropertyInitialization: false`). Uses `emitDecoratorMetadata`.
- Findings: DTOs use `class-validator` (not Zod) despite project rule; no Zod dependency. `app.enableCors()` with no options (allows all origins) — security. `console.log` in `main.ts`. `NotFoundException` imported unused in `rbac.service.ts` (lint). `reviewerId` unused param in controller. `logAudit` swallows errors (acceptable but no observability).

## 9. Drizzle ORM and Neon assessment
- **Compliant with observations.** Schema uses `pgTable`, indexes, checks, UUID defaults, timestamps. `drizzle.config.ts` targets `src/db/schema/index.ts`. Neon HTTP driver used. Queries use `eq/and/inArray`. Some N+1 risk in `listAllUsers` (Promise.all per user) — performance (Low/Medium). `db` typed as `NeonHttpDatabase` without schema generic (minor).

## 10. Zod validation assessment
- **Non-compliant with stated project boundary (needs attention).** No `zod` usage or dependency; validation via `class-validator` decorators in DTOs. Per project rules, Zod is the intended validator. This is a discrepancy between documented stack and implementation. No recommendation to migrate without authorization (per rules, do not introduce alternative; but here the declared boundary is Zod). Flag for decision.

## 11. Zustand assessment
- **Not used / Not applicable.** No Zustand dependency or usage in mobile or server. Project rules declare Zustand as state management, but implementation uses React Context (`AuthContext`, `ThemeContext`) + `useState`. Flag: either adopt or update rules.

## 12. Better Auth and RBAC security assessment
- **Needs attention.** Better Auth `drizzleAdapter` with schema mapping. Bearer plugin enabled; server-side session fallback in `RbacGuard`. Mobile stores session in SecureStore (web uses localStorage) and sends Bearer token. 
- Security findings:
  - `secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me"` (High if prod missing env).
  - `app.enableCors()` no options (High).
  - `trustedOrigins` includes `exp://*`, `http://localhost:*`, `http://192.168.*` (Medium; broad but dev-oriented).
  - `requireEmailVerification: false` (acceptable for dev).
  - No rate limiting observed.
  - `RbacGuard` checks user status ACTIVE; roles and approval statuses enforced.
  - Mobile `clearSession` calls `/auth/sign-out` before local cleanup (good). `authInterceptor` parses session JSON without try/catch (Medium: crash risk if corrupt storage).
  - `SESSION_KEY` duplicated in storage.ts and auth.tsx (Medium: same value, but two definitions).

## 13. Redis and real-time assessment
- **Not used / Not applicable.** No Redis client, no Socket.IO, no real-time code in server src. Project rules mention Redis/caching but not implemented. Flag as unused declared tech.

## 14. Mobile/backend integration assessment
- **Compliant with observations.** Axios base URL resolution (`localhost` on web in dev, dev host on native). Bearer token interceptor. `apiErrorMessage` helper. Auth flow: sign-in → setSession → refreshAuthorization → redirect `/`.
- Findings: `authInterceptor` does `JSON.parse(raw)` without try/catch (Medium). Mobile `storage.ts` SESSION_KEY and `auth.tsx` SESSION_KEY same string but separate exports (minor). Shared types stale (`DELIVER` vs `DRIVER`).

## 15. TypeScript quality assessment
- **Compliant with observations.** Strict mode both apps; `tsc --noEmit` exit 0 (mobile and server). 
- Findings: `any` usage in admin screens, controllers, services (Low/Medium). `as any` casts (auth.ts, auth.service.ts). Suppressed none (`@ts-ignore` not found). Compiled `.js` files in `src/` pollute typecheck? tsc passes because .js maybe excluded? Actually server tsc passes. But vitest loads .js.

## 16. Deprecated and outdated API inventory
- Mobile: no deprecated RN components found (`SafeAreaView` from safe-area-context is correct). `@expo/vector-icons` used (acceptable; expo-native-ui prefers SF Symbols on iOS, but not a defect).
- Server: `class-validator`/`class-transformer` (not deprecated, but conflicts with Zod boundary). `dotenv` direct usage. `@nestjs/observe` (optional).
- Compiled `.js` alongside `.ts` in `src/` (server) and (previously) `src/app` (mobile) — stale artifacts; High maintainability/testability.

## 17. Dependency compatibility findings
- Mobile Expo SDK 58 packages aligned. `axios ^1.21.0` (very old major? axios 1.x latest ~1.7; ^1.21.0 is impossible/outdated spec — Medium). `nativewind 4.2.7` with RN 0.88/Expo 58 (check compatibility; nativewind 4 supports RN 0.74+ generally; potential). `react-native-worklets 0.13.0` with reanimated 4.7.1 (likely compatible).
- Server: NestJS 12, Drizzle rc.5 (release candidate), Better Auth 1.7, Neon serverless 1.2 — generally compatible. `@types/node ^24` with Node maybe okay.

## 18. Security findings
1. **High** — `apps/server/src/main.ts:8` `app.enableCors()` with no options allows all origins.
2. **High** — `apps/server/src/auth.ts:28` fallback secret `"dev-secret-change-me"` if env missing.
3. **Medium** — trustedOrigins wildcards `exp://*`, `http://localhost:*`.
4. **Medium** — mobile `authInterceptor` `JSON.parse(raw)` without try/catch (`apps/mobile-client/src/lib/axios.ts:45-47`).
5. **Medium** — mobile web storage uses `localStorage` for session token (XSS risk if web deployed) — `storage.ts`.
6. **Low** — no rate limiting on auth endpoints (not verified).
7. **Low** — `console.log` server startup (informational).

## 19. Performance and maintainability findings
- **High** — Compiled `.js` files in `src/` (server) and previously in mobile `src/app` cause duplicate-module/test failures and Metro route conflicts. Vitest tests fail to load (`Cannot read properties of undefined (reading 'value')` at `rbac.controller.js:96`) because stale compiled JS shadows TS.
- **Medium** — `listAllUsers` N+1 queries.
- **Medium** — `initializePermissions` sequential DB calls in loops (okay for init).
- **Low** — Mobile admin screens use `FlatList` inside `ScrollView` (nested scroll).
- **Low** — `any` usage reduces type safety.
- **Low** — duplicated `.js`/`.tsx` component files (`AuthScaffold.js`, `Avatar.js`, etc.) in mobile components (8 pairs) — maintainability/drift.

## 20. Verification commands and actual results
- `cd apps/mobile-client; pnpm exec tsc --noEmit` → exit **0**.
- `cd apps/server; npx tsc --noEmit` → exit **0**.
- `cd apps/server; pnpm run lint` (oxlint) → exit **1** (warnings only; no errors reported in tail; exit code 1 likely due to warnings? Actually oxlint returns 1 on warnings? It printed many warnings; exit 1).
- `cd apps/server; pnpm test` (vitest) → exit **1**, 4 failed suites (compiled .js shadowing), 1 passed suite, 11 tests passed.
- `cd apps/mobile-client; pnpm run lint` → exit **0** (62 warnings, 0 errors).
- Mobile Android export (earlier) → `Exported: dist`, no duplicate-route error.
- No DB migrations/seeds run.

## 21. Runtime behavior that remains unverified
- Mobile authenticated role shells on device/web not exercised in this audit (no adb/SDK). 
- Backend runtime endpoints not exercised (server may be running but not tested here).
- Redis/real-time not implemented, so N/A.

## 22. Prioritized issue register
| # | Severity | Category | File | Issue |
|---|---|---|---|---|
| 1 | High | Maintainability/Compatibility | apps/server/src (all .js) + mobile src/app (resolved) | Compiled .js shadowing .ts breaks tests/Metro |
| 2 | High | Security | apps/server/src/main.ts:8 | Unrestricted CORS |
| 3 | High | Security | apps/server/src/auth.ts:28 | Fallback dev secret |
| 4 | Medium | Security | apps/server/src/auth.ts:58-66 | Broad trustedOrigins wildcards |
| 5 | Medium | Validation/Architecture | apps/server/src/auth/dto/*.ts | class-validator instead of declared Zod |
| 6 | Medium | Maintainability | packages/types/index.ts | Stale `DELIVER`/singular role |
| 7 | Medium | Maintainability/Design | mobile src components *.js + screens | Duplicated compiled/component .js files |
| 8 | Medium | Performance | rbac.service.ts listAllUsers | N+1 |
| 9 | Medium | Security/Robustness | mobile lib/axios.ts:45-47 | JSON.parse without try/catch |
| 10 | Low | Security | mobile lib/storage.ts | localStorage session on web |
| 11 | Low | Modernity | mobile screens | hardcoded hex outside theme |
| 12 | Low | Architecture | mobile | Zustand declared but unused |
| 13 | Low | Architecture | server | Redis declared but unused |

## 23. Recommended repair sequence
1. Remove compiled `.js` from `src/` (server) and ensure build outputs go to `dist/` only; fix vitest to not load stale JS. (Do not run destructive cleanup without authorization; report only.)
2. Restrict CORS to known origins; remove secret fallback (require env); tighten trustedOrigins.
3. Decide validation strategy: adopt Zod (per project rules) or update rules to class-validator; if Zod, migrate DTOs.
4. Update shared types to match RBAC (`DRIVER`, roles array).
5. Remove duplicate mobile `.js` component files (keep `.tsx`).
6. Address N+1 in listAllUsers; harden axios interceptor JSON parsing.
7. Tokenize hardcoded colors/spacing into existing theme (additive, preserving design).
8. Decide on Zustand/Redis: implement or remove from declared stack.

## Compliance matrix

| Area | Status | Evidence | Findings |
|---|---|---|---|
| Expo SDK | Compliant with observations | expo 58.0.23, router 58.0.30; tsc 0 | nativeWind compat check; .js duplicates resolved |
| Expo Router | Compliant with observations | root Stack preserved; role groups; useSegments tabs | tabs fixed; shared routes registered |
| React Native | Compliant with observations | safe-area-context used; FlatList/ScrollView | nested scroll in admin screens |
| Native UI | Compliant with observations | Screen/AuthScaffold safe areas | contentInsetAdjustmentBehavior optional |
| Existing theme and tokens | Needs attention | lib/theme.tsx tokens; hardcoded hex in screens | spacing not tokenized; drift |
| Shared UI components | Compliant with observations | components/* reused | duplicate .js files |
| NestJS | Compliant with observations | Nest 12; strict; DI/guards | CORS unrestricted; secret fallback |
| Drizzle ORM | Compliant with observations | schema indexes/checks | N+1 listAllUsers |
| Neon PostgreSQL | Compliant with observations | neon-http driver | none |
| Zod | Non-compliant (declared but unused) | no zod dep; class-validator used | strategy mismatch |
| Zustand | Not used | no dep/usage | declared but unused |
| Redis | Not used | no dep/usage | declared but unused |
| Better Auth | Needs attention | better-auth 1.7; bearer; guard fallback | secret fallback; broad origins |
| RBAC | Compliant with observations | rbac.guard/service/decorator | approval checks enforced |
| Mobile/API integration | Compliant with observations | axios base + interceptor | JSON.parse risk |
| TypeScript | Compliant | tsc exit 0 both apps | any usage; compiled .js |
| Security | Needs attention | CORS, secret, origins, interceptor | see section 18 |
| Performance | Needs attention | N+1; nested scroll | see section 19 |

---

Audit complete. No source files were modified. Awaiting explicit authorization before any fixes.