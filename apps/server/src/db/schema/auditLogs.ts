import { pgTable, text, timestamp, uuid, index, jsonb, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.js";

export const auditLogs = pgTable("audit_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
	action: text("action").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: uuid("entity_id"),
	oldValues: jsonb("old_values"),
	newValues: jsonb("new_values"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("audit_logs_user_id_idx").on(table.userId),
	index("audit_logs_action_idx").on(table.action),
	index("audit_logs_entity_idx").on(table.entityType, table.entityId),
	index("audit_logs_created_at_idx").on(table.createdAt),
	check("audit_logs_action_not_empty", sql`length(trim(action)) > 0`),
	check("audit_logs_entity_type_not_empty", sql`length(trim(entity_type)) > 0`),
]);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
