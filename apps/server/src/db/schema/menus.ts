import { boolean, numeric, pgTable, text, timestamp, uuid, integer, check, index, unique, foreignKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { restaurants } from "./restaurants.js";
import { branches } from "./branches.js";

export const menuCategories = pgTable('menu_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index('menu_categories_restaurant_id_idx').on(table.restaurantId),
    unique('menu_categories_restaurant_name_unique').on(table.restaurantId, table.name),
    unique('menu_categories_id_restaurant_id_unique').on(table.id, table.restaurantId),
]);

export const menuItems = pgTable('menu_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').notNull().references(() => menuCategories.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    isAvailable: boolean('is_available').default(true).notNull(),
    isVegetarian: boolean('is_vegetarian').default(false).notNull(),
    isVegan: boolean('is_vegan').default(false).notNull(),
    preparationTimeMinutes: integer('preparation_time_minutes'),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => [
    index('menu_items_category_id_idx').on(table.categoryId),
    index('menu_items_restaurant_id_idx').on(table.restaurantId),
    unique('menu_items_id_restaurant_id_unique').on(table.id, table.restaurantId),
    check('menu_items_price_non_negative', sql`price >= 0`),
    check('menu_items_prep_time_non_negative', sql`preparation_time_minutes IS NULL OR preparation_time_minutes >= 0`),
    foreignKey({
        columns: [table.categoryId, table.restaurantId],
        foreignColumns: [menuCategories.id, menuCategories.restaurantId],
    }),
]);

export const branchMenuItems = pgTable('branch_menu_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
    restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
    menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'restrict' }),
    isAvailable: boolean('is_available').default(true).notNull(),
    priceOverride: numeric('price_override', { precision: 10, scale: 2 }),
    preparationTimeMinutesOverride: integer('preparation_time_minutes_override'),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    unique('branch_menu_items_branch_item_unique').on(table.branchId, table.menuItemId),
    index('branch_menu_items_branch_id_idx').on(table.branchId),
    index('branch_menu_items_branch_available_idx').on(table.branchId, table.isAvailable),
    index('branch_menu_items_menu_item_id_idx').on(table.menuItemId),
    check('branch_menu_items_price_override_non_negative', sql`price_override IS NULL OR price_override >= 0`),
    check('branch_menu_items_prep_override_non_negative', sql`preparation_time_minutes_override IS NULL OR preparation_time_minutes_override >= 0`),
    foreignKey({
        columns: [table.branchId, table.restaurantId],
        foreignColumns: [branches.id, branches.restaurantId],
    }),
    foreignKey({
        columns: [table.menuItemId, table.restaurantId],
        foreignColumns: [menuItems.id, menuItems.restaurantId],
    }),
]);

export type MenuCategory = typeof menuCategories.$inferSelect;
export type NewMenuCategory = typeof menuCategories.$inferInsert;

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

export type BranchMenuItem = typeof branchMenuItems.$inferSelect;
export type NewBranchMenuItem = typeof branchMenuItems.$inferInsert;