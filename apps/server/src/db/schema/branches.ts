import { boolean, numeric, pgTable, text, timestamp, uuid, time, pgEnum, check, index, unique, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { restaurants } from "./restaurants.js";

export const branchStatusEnum = pgEnum('branch_status', [
    "ACTIVE", "INACTIVE", "SUSPENDED"
])

export const branches = pgTable('branches', {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    address: text('address').notNull(),
    city: text('city'),
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),
    phoneNumber: text('phone_number'),
    email: text('email'),
    status: branchStatusEnum('status').notNull().default('ACTIVE'),
    isOpen: boolean('is_open').default(false).notNull(),
    openingTime: time('opening_time'),
    closingTime: time('closing_time'),
    deliveryRadiusKm: numeric('delivery_radius_km', { precision: 6, scale: 2 }),
    deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }),
    minOrderAmount: numeric('min_order_amount', { precision: 10, scale: 2 }),
    preparationTimeMinutes: integer('preparation_time_minutes'),
    isDeliveryEnabled: boolean('is_delivery_enabled').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
    index('branches_restaurant_id_idx').on(table.restaurantId),
    index('branches_status_idx').on(table.status),
    unique('branches_id_restaurant_id_unique').on(table.id, table.restaurantId),
    check('branches_delivery_radius_non_negative', sql`delivery_radius_km IS NULL OR delivery_radius_km >= 0`),
    check('branches_delivery_fee_non_negative', sql`delivery_fee IS NULL OR delivery_fee >= 0`),
    check('branches_min_order_non_negative', sql`min_order_amount IS NULL OR min_order_amount >= 0`),
    check('branches_prep_time_non_negative', sql`preparation_time_minutes IS NULL OR preparation_time_minutes >= 0`),
]);

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;