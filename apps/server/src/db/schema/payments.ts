import { numeric, pgEnum, pgTable, text, timestamp, uuid, check, index, unique, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { Orders } from "./orders.js";
import { users } from "./user.js";
import { paymentMethodEnum } from "./orders.js";

export const paymentProviderEnum = pgEnum('payment_provider', [
    "STRIPE", "CASH", "JAZZCASH", "EASYPAISA", "OTHER"
])

export const paymentIntentStatusEnum = pgEnum('payment_intent_status', [
    "REQUIRES_PAYMENT_METHOD", "REQUIRES_CONFIRMATION", "REQUIRES_ACTION", "PROCESSING", "SUCCEEDED", "CANCELED"
])

export const refundStatusEnum = pgEnum('refund_status', [
    "PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "CANCELLED"
])

export const payments = pgTable('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').notNull().references(() => Orders.id, { onDelete: 'restrict' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('PKR').notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull().default('COD'),
    provider: paymentProviderEnum('provider').notNull().default('CASH'),
    providerPaymentId: text('provider_payment_id'),
    providerPaymentIntentId: text('provider_payment_intent_id'),
    status: paymentIntentStatusEnum('status').notNull().default('REQUIRES_PAYMENT_METHOD'),
    idempotencyKey: text('idempotency_key'),
    failureReason: text('failure_reason'),
    capturedAt: timestamp('captured_at', { withTimezone: true }),
    refundedAmount: numeric('refunded_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('payments_order_id_idx').on(table.orderId),
    index('payments_user_id_idx').on(table.userId),
    index('payments_status_idx').on(table.status),
    unique('payments_idempotency_key_unique').on(table.idempotencyKey),
    unique('payments_provider_intent_unique').on(table.provider, table.providerPaymentIntentId),
    check('payments_amount_non_negative', sql`amount >= 0`),
    check('payments_refunded_amount_non_negative', sql`refunded_amount >= 0`),
    check('payments_refunded_not_exceed_amount', sql`refunded_amount <= amount`),
]);

export const refunds = pgTable('refunds', {
    id: uuid('id').primaryKey().defaultRandom(),
    paymentId: uuid('payment_id').notNull().references(() => payments.id, { onDelete: 'restrict' }),
    orderId: uuid('order_id').notNull().references(() => Orders.id, { onDelete: 'restrict' }),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    reason: text('reason'),
    status: refundStatusEnum('status').notNull().default('PENDING'),
    providerRefundId: text('provider_refund_id'),
    idempotencyKey: text('idempotency_key'),
    failureReason: text('failure_reason'),
    processedBy: uuid('processed_by').references(() => users.id, { onDelete: 'restrict' }),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('refunds_payment_id_idx').on(table.paymentId),
    index('refunds_order_id_idx').on(table.orderId),
    index('refunds_status_idx').on(table.status),
    unique('refunds_idempotency_key_unique').on(table.idempotencyKey),
    unique('refunds_provider_refund_id_unique').on(table.providerRefundId),
    check('refunds_amount_positive', sql`amount > 0`),
]);

export const paymentEvents = pgTable('payment_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    paymentId: uuid('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
    providerEventId: text('provider_event_id').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload'),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('payment_events_payment_id_idx').on(table.paymentId),
    index('payment_events_event_type_idx').on(table.eventType),
    unique('payment_events_provider_event_unique').on(table.paymentId, table.providerEventId),
]);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Refund = typeof refunds.$inferSelect;
export type NewRefund = typeof refunds.$inferInsert;
export type PaymentEvent = typeof paymentEvents.$inferSelect;
export type NewPaymentEvent = typeof paymentEvents.$inferInsert;