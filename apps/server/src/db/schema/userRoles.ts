import { pgTable, text, timestamp, uuid, index, unique, check, foreignKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.js";

export const userRoles = pgTable("user_roles", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	role: text("role").notNull(),
	assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
	assignedBy: uuid("assigned_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => [
	unique("user_roles_user_role_unique").on(table.userId, table.role),
	index("user_roles_user_id_idx").on(table.userId),
	index("user_roles_role_idx").on(table.role),
	check("user_roles_role_not_empty", sql`length(trim(role)) > 0`),
]);

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;

export const rolePermissions = pgTable("role_permissions", {
	id: uuid("id").primaryKey().defaultRandom(),
	role: text("role").notNull(),
	permissionId: uuid("permission_id").notNull().references(() => require("./permissions.js").permissions.id, { onDelete: "cascade" }),
	assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	unique("role_permissions_role_permission_unique").on(table.role, table.permissionId),
	index("role_permissions_role_idx").on(table.role),
	index("role_permissions_permission_id_idx").on(table.permissionId),
	check("role_permissions_role_not_empty", sql`length(trim(role)) > 0`),
]);

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
