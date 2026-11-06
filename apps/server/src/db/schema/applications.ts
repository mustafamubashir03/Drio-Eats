import { pgTable, text, timestamp, uuid, index, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.js";

export const driverApplications = pgTable("driver_applications", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
	status: text("status").notNull().default("NOT_APPLIED"),
	applicationData: text("application_data"), // JSON string
	vehicleType: text("vehicle_type"),
	vehiclePlateNumber: text("vehicle_plate_number"),
	licenseNumber: text("license_number"),
	reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
	rejectionReason: text("rejection_reason"),
	submittedAt: timestamp("submitted_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("driver_applications_user_id_idx").on(table.userId),
	index("driver_applications_status_idx").on(table.status),
	check("driver_applications_status_not_empty", sql`length(trim(status)) > 0`),
	check("driver_applications_valid_status", sql`status IN ('NOT_APPLIED', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')`),
]);

export type DriverApplication = typeof driverApplications.$inferSelect;
export type NewDriverApplication = typeof driverApplications.$inferInsert;

export const DRIVER_APPROVAL_STATUSES = ["NOT_APPLIED", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export type DriverApprovalStatus = typeof DRIVER_APPROVAL_STATUSES[number];

export const restaurantOwnerApplications = pgTable("restaurant_owner_applications", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
	status: text("status").notNull().default("NOT_APPLIED"),
	applicationData: text("application_data"), // JSON string
	restaurantName: text("restaurant_name"),
	cuisineType: text("cuisine_type"),
	address: text("address"),
	reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
	rejectionReason: text("rejection_reason"),
	submittedAt: timestamp("submitted_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("restaurant_owner_applications_user_id_idx").on(table.userId),
	index("restaurant_owner_applications_status_idx").on(table.status),
	check("restaurant_owner_applications_status_not_empty", sql`length(trim(status)) > 0`),
	check("restaurant_owner_applications_valid_status", sql`status IN ('NOT_APPLIED', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')`),
]);

export type RestaurantOwnerApplication = typeof restaurantOwnerApplications.$inferSelect;
export type NewRestaurantOwnerApplication = typeof restaurantOwnerApplications.$inferInsert;

export const OWNER_APPROVAL_STATUSES = ["NOT_APPLIED", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export type OwnerApprovalStatus = typeof OWNER_APPROVAL_STATUSES[number];
