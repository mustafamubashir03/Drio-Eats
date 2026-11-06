import { integer, pgTable, text, timestamp, uuid, pgEnum, uniqueIndex, check, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.js";
import { restaurants } from "./restaurants.js";
import { Orders } from "./orders.js";
import { drivers } from "./drivers.js";

export const reviewStatusEnum = pgEnum('review_status', [
    "PENDING", "APPROVED", "REJECTED"
])

export const reviews = pgTable("reviews", {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").notNull().references(() => users.id, { onDelete: "restrict" }),
    restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "restrict" }),
    orderId: uuid("order_id").notNull().references(() => Orders.id, { onDelete: "restrict" }),
    driverId: uuid("driver_id").references(() => drivers.id, { onDelete: "set null" }),
    restaurantRating: integer("restaurant_rating").notNull(),
    driverRating: integer("driver_rating"),
    comment: text("comment"),
    status: reviewStatusEnum('status').notNull().default('PENDING'),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex('reviews_order_id_unique').on(table.orderId),
    index('reviews_restaurant_id_idx').on(table.restaurantId),
    index('reviews_customer_id_idx').on(table.customerId),
    index('reviews_driver_id_idx').on(table.driverId),
    index('reviews_status_idx').on(table.status),
    check('reviews_restaurant_rating_range', sql`restaurant_rating >= 1 AND restaurant_rating <= 5`),
    check('reviews_driver_rating_range', sql`driver_rating IS NULL OR (driver_rating >= 1 AND driver_rating <= 5)`),
]);

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert