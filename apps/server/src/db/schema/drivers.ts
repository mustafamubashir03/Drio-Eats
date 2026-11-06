import { boolean, numeric, pgTable, text, timestamp, uuid, pgEnum, check, index, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user.js";
import { restaurants } from "./restaurants.js";
import { branches } from "./branches.js";

export const driverTypeEnum = pgEnum('driver_type', [
    "PLATFORM", "RESTAURANT_OWNED"
])

export const driverApprovalStatusEnum = pgEnum('driver_approval_status', [
    "PENDING", "APPROVED", "REJECTED", "SUSPENDED"
])

export const driverAvailabilityStatusEnum = pgEnum('driver_availability_status', [
    "OFFLINE", "ONLINE", "BUSY"
])

export const vehicleTypeEnum = pgEnum('vehicle_type', [
    "BIKE", "MOTORCYCLE", "CAR", "SCOOTER"
])

export const drivers = pgTable('drivers', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    restaurantId: uuid('restaurant_id').references(() => restaurants.id, { onDelete: 'set null' }),
    type: driverTypeEnum('type').notNull().default('PLATFORM'),
    approvalStatus: driverApprovalStatusEnum('approval_status').notNull().default('PENDING'),
    availabilityStatus: driverAvailabilityStatusEnum('availability_status').notNull().default('OFFLINE'),
    vehicleType: vehicleTypeEnum('vehicle_type'),
    vehiclePlateNumber: text('vehicle_plate_number'),
    licenseNumber: text('license_number'),
    licenseExpiry: timestamp('license_expiry', { withTimezone: true }),
    currentLat: numeric('current_lat', { precision: 10, scale: 7 }),
    currentLng: numeric('current_lng', { precision: 10, scale: 7 }),
    lastLocationUpdateAt: timestamp('last_location_update_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
    index('drivers_user_id_idx').on(table.userId),
    index('drivers_restaurant_id_idx').on(table.restaurantId),
    index('drivers_approval_status_idx').on(table.approvalStatus),
    index('drivers_availability_status_idx').on(table.availabilityStatus),
    check('drivers_restaurant_owned_requires_restaurant', sql`type <> 'RESTAURANT_OWNED' OR restaurant_id IS NOT NULL`),
]);

export const driverBranches = pgTable('driver_branches', {
    id: uuid('id').primaryKey().defaultRandom(),
    driverId: uuid('driver_id').notNull().references(() => drivers.id, { onDelete: 'cascade' }),
    branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    unique('driver_branches_driver_branch_unique').on(table.driverId, table.branchId),
    index('driver_branches_driver_id_idx').on(table.driverId),
    index('driver_branches_branch_id_idx').on(table.branchId),
]);

export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
export type DriverBranch = typeof driverBranches.$inferSelect;
export type NewDriverBranch = typeof driverBranches.$inferInsert;