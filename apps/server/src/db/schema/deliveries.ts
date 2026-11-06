import { numeric, pgEnum, pgTable, text, timestamp, uuid, integer, check, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Orders } from "./orders.js";
import { drivers } from "./drivers.js";

export const deliveryStatusEnum = pgEnum('delivery_status', [
    "PENDING_ASSIGNMENT", "ASSIGNED", "DRIVER_ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED", "CANCELLED"
])

export const deliveryAttemptStatusEnum = pgEnum('delivery_attempt_status', [
    "ASSIGNED", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED", "COMPLETED"
])

export const deliveries = pgTable('deliveries', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().unique().references(() => Orders.id, { onDelete: 'cascade' }),
    currentDriverId: uuid('current_driver_id').references(() => drivers.id, { onDelete: 'set null' }),
    status: deliveryStatusEnum('status').notNull().default('PENDING_ASSIGNMENT'),
    deliveryAddress: text('delivery_address').notNull(),
    deliveryAddressLat: numeric('delivery_address_lat', { precision: 10, scale: 7 }),
    deliveryAddressLng: numeric('delivery_address_lng', { precision: 10, scale: 7 }),
    deliveryFeeCharged: numeric('delivery_fee_charged', { precision: 10, scale: 2 }),
    distanceKm: numeric('distance_km', { precision: 6, scale: 2 }),
    estimatedDeliveryMinutes: integer('estimated_delivery_minutes'),
    proofOfDeliveryUrl: text('proof_of_delivery_url'),
    assignedAt: timestamp('assigned_at', { withTimezone: true }),
    driverAcceptedAt: timestamp('driver_accepted_at', { withTimezone: true }),
    pickedUpAt: timestamp('picked_up_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('deliveries_order_id_idx').on(table.orderId),
    index('deliveries_current_driver_id_idx').on(table.currentDriverId),
    index('deliveries_status_idx').on(table.status),
    check('deliveries_distance_non_negative', sql`distance_km IS NULL OR distance_km >= 0`),
    check('deliveries_delivery_fee_non_negative', sql`delivery_fee_charged IS NULL OR delivery_fee_charged >= 0`),
    check('deliveries_estimated_minutes_non_negative', sql`estimated_delivery_minutes IS NULL OR estimated_delivery_minutes >= 0`),
]);

export const deliveryAttempts = pgTable('delivery_attempts', {
    id: uuid('id').primaryKey().defaultRandom(),
    deliveryId: uuid('delivery_id').notNull().references(() => deliveries.id, { onDelete: 'cascade' }),
    driverId: uuid('driver_id').notNull().references(() => drivers.id, { onDelete: 'restrict' }),
    status: deliveryAttemptStatusEnum('status').notNull().default('ASSIGNED'),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull(),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
    expiredAt: timestamp('expired_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),
    assignmentDeadline: timestamp('assignment_deadline', { withTimezone: true }).notNull(),
    acceptanceDeadline: timestamp('acceptance_deadline', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('delivery_attempts_delivery_id_idx').on(table.deliveryId),
    index('delivery_attempts_driver_id_idx').on(table.driverId),
    index('delivery_attempts_status_idx').on(table.status),
    index('delivery_attempts_assigned_at_idx').on(table.assignedAt),
]);

export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
export type DeliveryAttempt = typeof deliveryAttempts.$inferSelect;
export type NewDeliveryAttempt = typeof deliveryAttempts.$inferInsert;