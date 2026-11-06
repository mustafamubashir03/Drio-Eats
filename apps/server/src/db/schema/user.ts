import { pgTable, text, timestamp, uuid, pgEnum, boolean, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum('user_role', [
    "CUSTOMER", "RESTAURANT_OWNER", "DRIVER", "ADMIN"
])

export const userStatusEnum = pgEnum('user_status', [
    "ACTIVE", "SUSPENDED", "BANNED", "INACTIVE"
])

export const users = pgTable("users", {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text('email').notNull().unique(),
    name: text('name'),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    phoneNumber: text('phone_number'),
    password: text('password'),
    role: userRoleEnum('role').notNull().default('CUSTOMER'),
    status: userStatusEnum('status').notNull().default('ACTIVE'),
    pushToken: text('push_token'),
    isOnline: boolean('is_online').default(false).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

}, () => [
    check('users_email_not_empty', sql`length(trim(email)) > 0`),
]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;