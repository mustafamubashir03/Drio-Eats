# FIX: Better Auth "MISSING_OR_NULL_ORIGIN" on Native Sign-in — REPORT

## Root Cause Analysis

1. **Server `auth.ts` trustedOrigins**: Already includes `'drio-eats://'` and `'exp://192.168.*.*:*/*'`, `'exp://'`, `'exp://*'` patterns (lines 53-60). ✓
2. **Mobile app `app.json` scheme**: `'drio-eats'` (matches trustedOrigins). ✓
3. **Native React Native requests**: Do NOT send `Origin` header (expected behavior; browsers do, so web tests pass). ✓
4. **`better-auth validateOrigin` function** (`better-auth/dist/api/middlewares/origin-check.mjs`): Has early return `if (!(forceValidate || useCookies)) return;` which should **skip the origin check entirely** for native requests (no cookies, no `forceValidate`). ✓
5. **User reports**: 403 "Missing or null Origin" on native sign-in despite above configurations. ✗

## Evidence

| Check | Result |
|---|---|
| Server `trustedOrigins` has `drio-eats://` | ✓ Present in `apps/server/src/auth.ts` |
| App scheme matches `drio-eats` | ✓ Present in `apps/mobile-client/app.json` |
| Native requests send no `Origin` header | ✓ Expected per Better Auth docs comment |
| `validateOrigin` early return `if (!(forceValidate || useCookies)) return` | ✓ In `better-auth/dist/api/middlewares/origin-check.mjs` |
| User still gets 403 "MISSING_OR_NULL_ORIGIN" | ✗ Contradicts expected behavior |

## Issue

The `validateOrigin` early return should cause the function to return before reaching the `MISSING_OR_NULL_ORIGIN` throw line (line 111 of `origin-check.mjs`). However, the user still encounters the error, suggesting either:

- The early return is not being reached in their specific NestJS + better-auth setup
- A different code path is being taken (e.g., the standalone `originCheck` function vs `originCheckMiddleware`)
- The `AuthModule` NestJS integration wires origin checking differently

## Step 2 — Temporary Log

**Cannot execute**: No Expo Go/emulator/adb available on this workstation. A web test proves nothing for native origin handling. Per rules: "If you can't test native, say 'NOT verified on native.'"

## Step 3 — Apply Fix the Evidence Points To

The evidence path: `'expo-origin missing -> app isn't using expoClient with the right scheme + SecureStore storage.'`

- `'@better-auth/expo'` package: **Not found** in `node_modules`
- `'expo()'` plugin in better-auth v1.7.15 dist: **Not found** among the 80+ plugin files
- Rules: **"Do not invent options or APIs"** + **"Ask before adding a dependency or changing the app scheme"**

Since the server config and app scheme already appear correct, and I cannot invent or add options/APIs without violating the rules, **no server-side code changes are applied** at this time.

## Step 4 — Verification

**Cannot verify on native**: No Expo Go, device, or emulator available. Per rules: "If you can't test native, say 'NOT verified on native.'"

## Summary

- Server `auth.ts` config and mobile app `app.json` scheme appear **correctly configured** for native Expo Go sign-in
- The `better-auth` `validateOrigin` function has logic that should skip origin checking for native requests (no `Origin` header, no cookies)
- The error still occurs, indicating either a different code path or a setup specific to the NestJS + better-auth integration
- **No changes applied** that violate the bare-minimum rules (no disabling checks, no `*` origins, no invented options)
- **NOT verified on native** — requires native client testing to identify the exact code path and fix