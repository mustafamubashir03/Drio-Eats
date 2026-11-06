import { pgTable, text, timestamp, uuid, index, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const permissions = pgTable("permissions", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
	description: text("description"),
	resource: text("resource").notNull(),
	action: text("action").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("permissions_name_idx").on(table.name),
	index("permissions_resource_action_idx").on(table.resource, table.action),
	check("permissions_name_not_empty", sql`length(trim(name)) > 0`),
	check("permissions_resource_not_empty", sql`length(trim(resource)) > 0`),
	check("permissions_action_not_empty", sql`length(trim(action)) > 0`),
]);

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export const PERMISSIONS = {
	// User management
	USER_READ: "user.read",
	USER_WRITE: "user.write",
	USER_MANAGE: "user.manage",

	// Customer
	CUSTOMER_MANAGE_PROFILE: "customer.manage_profile",
	CUSTOMER_VIEW_ORDERS: "customer.view_orders",
	CUSTOMER_PLACE_ORDER: "customer.place_order",

	// Driver
	DRIVER_APPLY: "driver.apply",
	DRIVER_READ: "driver.read",
	DRIVER_UPDATE_AVAILABILITY: "driver.update_availability",
	DRIVER_ACCEPT_DELIVERY: "driver.accept_delivery",
	DRIVER_PICKUP: "driver.pickup",
	DRIVER_DELIVER: "driver.deliver",
	DRIVER_VIEW_ASSIGNED_DELIVERIES: "driver.view_assigned_deliveries",

	// Restaurant Owner
	RESTAURANT_OWNER_APPLY: "restaurant_owner.apply",
	RESTAURANT_OWNER_CREATE_RESTAURANT: "restaurant_owner.create_restaurant",
	RESTAURANT_OWNER_MANAGE_MENU: "restaurant_owner.manage_menu",
	RESTAURANT_OWNER_VIEW_ORDERS: "restaurant_owner.view_orders",
	RESTAURANT_OWNER_ACCEPT_ORDER: "restaurant_owner.accept_order",
	RESTAURANT_OWNER_UPDATE_ORDER_STATUS: "restaurant_owner.update_order_status",

	// Superadmin
	SUPERADMIN_MANAGE_USERS: "superadmin.manage_users",
	SUPERADMIN_APPROVE_DRIVER: "superadmin.approve_driver",
	SUPERADMIN_REJECT_DRIVER: "superadmin.reject_driver",
	SUPERADMIN_SUSPEND_DRIVER: "superadmin.suspend_driver",
	SUPERADMIN_APPROVE_OWNER: "superadmin.approve_owner",
	SUPERADMIN_REJECT_OWNER: "superadmin.reject_owner",
	SUPERADMIN_SUSPEND_OWNER: "superadmin.suspend_owner",
	SUPERADMIN_VIEW_ANALYTICS: "superadmin.view_analytics",
	SUPERADMIN_MANAGE_ROLES: "superadmin.manage_roles",
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role -> Permission mapping
export const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
	CUSTOMER: [
		PERMISSIONS.USER_READ,
		PERMISSIONS.USER_WRITE,
		PERMISSIONS.CUSTOMER_MANAGE_PROFILE,
		PERMISSIONS.CUSTOMER_VIEW_ORDERS,
		PERMISSIONS.CUSTOMER_PLACE_ORDER,
	],
	DRIVER: [
		PERMISSIONS.USER_READ,
		PERMISSIONS.USER_WRITE,
		PERMISSIONS.DRIVER_READ,
		PERMISSIONS.DRIVER_UPDATE_AVAILABILITY,
		PERMISSIONS.DRIVER_ACCEPT_DELIVERY,
		PERMISSIONS.DRIVER_PICKUP,
		PERMISSIONS.DRIVER_DELIVER,
		PERMISSIONS.DRIVER_VIEW_ASSIGNED_DELIVERIES,
	],
	RESTAURANT_OWNER: [
		PERMISSIONS.USER_READ,
		PERMISSIONS.USER_WRITE,
		PERMISSIONS.RESTAURANT_OWNER_CREATE_RESTAURANT,
		PERMISSIONS.RESTAURANT_OWNER_MANAGE_MENU,
		PERMISSIONS.RESTAURANT_OWNER_VIEW_ORDERS,
		PERMISSIONS.RESTAURANT_OWNER_ACCEPT_ORDER,
		PERMISSIONS.RESTAURANT_OWNER_UPDATE_ORDER_STATUS,
	],
	SUPERADMIN: Object.values(PERMISSIONS),
};

export const ALL_ROLES = ["CUSTOMER", "DRIVER", "RESTAURANT_OWNER", "SUPERADMIN"] as const;
export type Role = typeof ALL_ROLES[number];
