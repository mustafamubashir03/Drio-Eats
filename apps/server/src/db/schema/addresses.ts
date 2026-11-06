import { boolean, numeric, pgTable, text, timestamp, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.js";

export const addresses = pgTable('addresses', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    label: text('label'),
    addressLine1: text('address_line1').notNull(),
    addressLine2: text('address_line2'),
    city: text('city'),
    state: text('state'),
    postalCode: text('postal_code'),
    country: text('country').default('Pakistan'),
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),
    deliveryInstructions: text('delivery_instructions'),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
    index('addresses_user_id_idx').on(table.userId),
    uniqueIndex('addresses_user_default_unique').on(table.userId).where(sql`is_default = true`),
]);

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;