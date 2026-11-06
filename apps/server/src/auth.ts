import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { bearer, jwt } from "better-auth/plugins";
import { db } from "./db/index.js";
import * as schema from "./db/schema/index.js";

// In development the Expo web/dev server can switch ports (8081, 8082, ...),
// so trust local and LAN origins there. Native clients don't send an Origin
// header at all; these entries exist for browser-based development.
const devOrigins =
  process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:*", "http://127.0.0.1:*", "http://192.168.*"];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      jwks: schema.jwks,
    },
    usePlural: false,
  }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: (() => {
    const secret = process.env.BETTER_AUTH_SECRET;
    if (process.env.NODE_ENV === "production" && !secret) {
      throw new Error("BETTER_AUTH_SECRET is required in production");
    }
    return secret ?? "dev-secret-change-me";
  })(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: false, input: true },
      lastName: { type: "string", required: false, input: true },
      status: { type: "string", required: false, input: false, defaultValue: "ACTIVE" },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              status: "ACTIVE",
              firstName: (user.firstName as string) || null,
              lastName: (user.lastName as string) || null,
              name: (user.name as string) || [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email,
            },
          };
        },
      },
    },
  },
  trustedOrigins: [
    ...devOrigins,
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:8082",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:8082",
    "drio-eats://",
    ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean) : []),
  ],
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  plugins: [jwt(), bearer()],
}) as any;

export type AuthInstance = typeof auth;