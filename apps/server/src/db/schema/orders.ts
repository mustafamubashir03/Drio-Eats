import { numeric, pgEnum, pgTable, text, timestamp, uuid, integer, check, index, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.js";
import { restaurants } from "./restaurants.js";
import { branches } from "./branches.js";
import { menuItems } from "./menus.js";
import { drivers } from "./drivers.js";

export const OrderStatusEnum = pgEnum('order_status', [
    "PENDING", "ACCEPTED", "REJECTED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "READY_FOR_DELIVERY", "CANCELLED"
])

export const paymentMethodEnum = pgEnum('payment_method', [
    "COD", "CARD", "WALLET", "BANK_TRANSFER", "OTHER"
])

export const paymentStatusEnum = pgEnum('payment_status', [
    "PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"
])

export const Orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: text('order_number').unique(),
    customerId: uuid('customer_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    driverId: uuid('driver_id').references(() => drivers.id, { onDelete: 'set null' }),
    restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'restrict' }),
    branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'restrict' }),
    subtotalAmount: numeric('subtotal_amount', { precision: 10, scale: 2 }).notNull(),
    deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }).default('0.00').notNull(),
    serviceFee: numeric('service_fee', { precision: 10, scale: 2 }).default('0.00').notNull(),
    discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
    taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    deliveryAddress: text('delivery_address').notNull(),
    deliveryAddressLat: numeric('delivery_address_lat', { precision: 10, scale: 7 }),
    deliveryAddressLng: numeric('delivery_address_lng', { precision: 10, scale: 7 }),
    deliveryInstructions: text('delivery_instructions'),
    customerNotes: text('customer_notes'),
    paymentMethod: paymentMethodEnum('payment_method').notNull().default('COD'),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('PENDING'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    status: OrderStatusEnum('status').notNull().default('PENDING'),
    restaurantAcceptanceDeadline: timestamp('restaurant_acceptance_deadline', { withTimezone: true }).notNull(),
    driverAssignmentDeadline: timestamp('driver_assignment_deadline', { withTimezone: true }).notNull(),
    driverAcceptanceDeadline: timestamp('driver_acceptance_deadline', { withTimezone: true }).notNull(),
    autoCancelAt: timestamp('auto_cancel_at', { withTimezone: true }),
    customerName: text('customer_name'),
    customerPhone: text('customer_phone'),
    restaurantName: text('restaurant_name').notNull(),
    restaurantAddress: text('restaurant_address'),
    restaurantPhone: text('restaurant_phone'),
    branchName: text('branch_name'),
    branchAddress: text('branch_address'),
    branchPhone: text('branch_phone'),
    deliveryRadiusKm: numeric('delivery_radius_km', { precision: 6, scale: 2 }),
    preparationTimeMinutes: integer('preparation_time_minutes'),
    deliveryConfigSnapshot: jsonb('delivery_config_snapshot'),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    rejectedAt: timestamp('rejected_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),
    preparedAt: timestamp('prepared_at', { withTimezone: true }),
    readyAt: timestamp('ready_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelledBy: uuid('cancelled_by').references(() => users.id, { onDelete: 'restrict' }),
    cancellationReason: text('cancellation_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
    index('orders_customer_id_idx').on(table.customerId),
    index('orders_restaurant_id_idx').on(table.restaurantId),
    index('orders_branch_id_idx').on(table.branchId),
    index('orders_driver_id_idx').on(table.driverId),
    index('orders_status_idx').on(table.status),
    index('orders_payment_status_idx').on(table.paymentStatus),
    index('orders_created_at_idx').on(table.createdAt),
    index('orders_customer_status_created_idx').on(table.customerId, table.status, table.createdAt),
    check('orders_subtotal_non_negative', sql`subtotal_amount >= 0`),
    check('orders_total_non_negative', sql`total_amount >= 0`),
    check('orders_delivery_fee_non_negative', sql`delivery_fee >= 0`),
    check('orders_service_fee_non_negative', sql`service_fee >= 0`),
    check('orders_discount_non_negative', sql`discount_amount >= 0`),
    check('orders_tax_non_negative', sql`tax_amount >= 0`),
]);


export const orderItems = pgTable('order_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => Orders.id, { onDelete: 'cascade' }),
    menuItemId: uuid('menu_item_id').references(() => menuItems.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull().default(1),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    itemName: text('item_name').notNull(),
    itemDescription: text('item_description'),
    itemImageUrl: text('item_image_url'),
    categoryName: text('category_name'),
    specialInstructions: text('special_instructions'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
    index('order_items_order_id_idx').on(table.orderId),
    index('order_items_menu_item_id_idx').on(table.menuItemId),
    check('order_items_quantity_positive', sql`quantity > 0`),
    check('order_items_unit_price_non_negative', sql`unit_price >= 0`),
]);

export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert

export type Order = typeof Orders.$inferSelect
export type NewOrder = typeof Orders.$inferInsert