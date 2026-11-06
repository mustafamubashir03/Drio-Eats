import { boolean, numeric, pgTable, text, timestamp, uuid, integer, pgEnum, check, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.js";

export const restaurantStatusEnum = pgEnum('restaurant_status', [
    "PENDING", "APPROVED", "REJECTED", "SUSPENDED"
])

export const deliveryModelEnum = pgEnum('delivery_model', [
    "PLATFORM", "RESTAURANT_OWNED", "HYBRID"
])

export const restaurants = pgTable('restaurants', {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    coverImageUrl: text('cover_image_url'),
    phoneNumber: text('phone_number'),
    email: text('email'),
    address: text('address').notNull(),
    city: text('city'),
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),
    cuisineType: text('cuisine_type').notNull(),
    isOpen: boolean('is_open').default(false).notNull(),
    isPaused: boolean('is_paused').default(false).notNull(),
    status: restaurantStatusEnum('status').notNull().default('PENDING'),
    deliveryModel: deliveryModelEnum('delivery_model').notNull().default('PLATFORM'),
    preparationTimeMinutes: integer('preparation_time_minutes'),
    deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }).default('0.00'),
    minOrderAmount: numeric('min_order_amount', { precision: 10, scale: 2 }).default('0.00'),
    rating: numeric('rating', { precision: 3, scale: 2 }).default('0.00').notNull(),
    ratingCount: integer('rating_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

}, (table) => [
    index('restaurants_owner_id_idx').on(table.ownerId),
    index('restaurants_city_status_is_open_idx').on(table.city, table.status, table.isOpen),
    check('restaurants_rating_range', sql`rating >= 0 AND rating <= 5`),
    check('restaurants_rating_count_non_negative', sql`rating_count >= 0`),
    check('restaurants_delivery_fee_non_negative', sql`delivery_fee IS NULL OR delivery_fee >= 0`),
    check('restaurants_min_order_non_negative', sql`min_order_amount IS NULL OR min_order_amount >= 0`),
    check('restaurants_prep_time_non_negative', sql`preparation_time_minutes IS NULL OR preparation_time_minutes >= 0`),
]);

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;