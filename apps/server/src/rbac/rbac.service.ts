import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { eq, and, inArray, sql } from "drizzle-orm";
import {
	permissions,
	userRoles,
	rolePermissions,
	driverApplications,
	restaurantOwnerApplications,
	auditLogs,
	users,
	drivers,
	restaurants,
} from "../db/schema/index.js";
import { deliveries } from "../db/schema/deliveries.js";
import { PERMISSIONS, ROLE_PERMISSIONS, ALL_ROLES, type PermissionKey, type Role } from "../db/schema/permissions.js";
import { DriverApprovalStatus, OwnerApprovalStatus } from "../db/schema/applications.js";

@Injectable()
export class RbacService {
	constructor(
		@Inject("DB") private readonly db: NeonHttpDatabase,
	) {}

	/**
	 * Get all roles assigned to a user.
	 */
	async getUserRoles(userId: string): Promise<string[]> {
		const rows = await this.db
			.select({ role: userRoles.role })
			.from(userRoles)
			.where(eq(userRoles.userId, userId));
		return rows.map((r) => r.role);
	}

	/**
	 * Get all permissions for a user (aggregated from all their roles).
	 */
	async getUserPermissions(userId: string): Promise<string[]> {
		const userRoleList = await this.getUserRoles(userId);
		if (userRoleList.length === 0) return [];

		const perms = await this.db
			.select({ permissionName: permissions.name })
			.from(rolePermissions)
			.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
			.where(inArray(rolePermissions.role, userRoleList));

		return [...new Set(perms.map((p) => p.permissionName))];
	}

	/**
	 * Check if a user has a specific permission.
	 */
	async hasPermission(userId: string, permission: PermissionKey): Promise<boolean> {
		const permissions = await this.getUserPermissions(userId);
		return permissions.includes(permission);
	}

	/**
	 * Check if a user has any of the specified permissions.
	 */
	async hasAnyPermission(userId: string, permissions: PermissionKey[]): Promise<boolean> {
		const userPerms = await this.getUserPermissions(userId);
		return permissions.some((p) => userPerms.includes(p));
	}

	/**
	 * Check if a user has all of the specified permissions.
	 */
	async hasAllPermissions(userId: string, permissions: PermissionKey[]): Promise<boolean> {
		const userPerms = await this.getUserPermissions(userId);
		return permissions.every((p) => userPerms.includes(p));
	}

	/**
	 * Check if a user has a specific role.
	 */
	async hasRole(userId: string, role: Role): Promise<boolean> {
		const roles = await this.getUserRoles(userId);
		return roles.includes(role);
	}

	/**
	 * Check if a user has any of the specified roles.
	 */
	async hasAnyRole(userId: string, roles: Role[]): Promise<boolean> {
		const userRoles = await this.getUserRoles(userId);
		return roles.some((r) => userRoles.includes(r));
	}

	/**
	 * Check if a user is a superadmin.
	 */
	async isSuperAdmin(userId: string): Promise<boolean> {
		return this.hasRole(userId, "SUPERADMIN");
	}

	/**
	 * Assign a role to a user (idempotent).
	 * Validates the role is a known role before assigning.
	 */
	async assignRole(userId: string, role: Role, assignedBy?: string): Promise<void> {
		// Validate role is known
		if (!ALL_ROLES.includes(role as any)) {
			throw new BadRequestException(`Invalid role: ${role}`);
		}

		const existing = await this.db
			.select()
			.from(userRoles)
			.where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)))
			.limit(1);

		if (existing.length > 0) return;

		await this.db.insert(userRoles).values({
			userId,
			role,
			assignedBy,
		});

		await this.logAudit(userId, "ROLE_ASSIGNED", "user", userId, undefined, { role, assignedBy });
	}

	/**
	 * Remove a role from a user.
	 * Prevents removing the last SUPERADMIN role.
	 */
	async revokeRole(userId: string, role: Role): Promise<void> {
		// Prevent removing the last SUPERADMIN
		if (role === "SUPERADMIN") {
			const superAdmins = await this.db
				.select()
				.from(userRoles)
				.where(eq(userRoles.role, "SUPERADMIN"));
			if (superAdmins.length <= 1 && superAdmins[0]?.userId === userId) {
				throw new BadRequestException("Cannot revoke the last SUPERADMIN role");
			}
		}

		await this.db
			.delete(userRoles)
			.where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));

		await this.logAudit(userId, "ROLE_REVOKED", "user", userId, undefined, { role });
	}

	/**
	 * Get driver application status for a user.
	 */
	async getDriverApplicationStatus(userId: string): Promise<DriverApprovalStatus | null> {
		const app = await this.db
			.select({ status: driverApplications.status })
			.from(driverApplications)
			.where(eq(driverApplications.userId, userId))
			.limit(1);
		return app.length > 0 ? (app[0].status as DriverApprovalStatus) : null;
	}

	/**
	 * Get restaurant owner application status for a user.
	 */
	async getRestaurantOwnerApplicationStatus(userId: string): Promise<OwnerApprovalStatus | null> {
		const app = await this.db
			.select({ status: restaurantOwnerApplications.status })
			.from(restaurantOwnerApplications)
			.where(eq(restaurantOwnerApplications.userId, userId))
			.limit(1);
		return app.length > 0 ? (app[0].status as OwnerApprovalStatus) : null;
	}

	/**
	 * Check if driver application is approved.
	 */
	async isDriverApproved(userId: string): Promise<boolean> {
		const status = await this.getDriverApplicationStatus(userId);
		return status === "APPROVED";
	}

	/**
	 * Check if restaurant owner application is approved.
	 */
	async isRestaurantOwnerApproved(userId: string): Promise<boolean> {
		const status = await this.getRestaurantOwnerApplicationStatus(userId);
		return status === "APPROVED";
	}

	/**
	 * Submit a driver application.
	 */
	async submitDriverApplication(
		userId: string,
		applicationData: { vehicleType?: string; vehiclePlateNumber?: string; licenseNumber?: string },
	): Promise<void> {
		const existing = await this.db
			.select()
			.from(driverApplications)
			.where(eq(driverApplications.userId, userId))
			.limit(1);

		if (existing.length > 0) {
			// Update existing application to PENDING if it was rejected/not applied
			const app = existing[0];
			if (app.status === "REJECTED" || app.status === "NOT_APPLIED") {
				await this.db
					.update(driverApplications)
					.set({
						status: "PENDING",
						applicationData: JSON.stringify(applicationData),
						vehicleType: applicationData.vehicleType ?? null,
						vehiclePlateNumber: applicationData.vehiclePlateNumber ?? null,
						licenseNumber: applicationData.licenseNumber ?? null,
						submittedAt: new Date(),
						reviewedBy: null,
						reviewedAt: null,
						rejectionReason: null,
						updatedAt: new Date(),
					})
					.where(eq(driverApplications.userId, userId));
			}
			return;
		}

		await this.db.insert(driverApplications).values({
			userId,
			status: "PENDING",
			applicationData: JSON.stringify(applicationData),
			vehicleType: applicationData.vehicleType ?? null,
			vehiclePlateNumber: applicationData.vehiclePlateNumber ?? null,
			licenseNumber: applicationData.licenseNumber ?? null,
			submittedAt: new Date(),
		});

		await this.logAudit(userId, "DRIVER_APPLICATION_SUBMITTED", "driver_application", undefined, undefined, {
			userId,
			status: "PENDING",
		});
	}

	/**
	 * Submit a restaurant owner application.
	 */
	async submitRestaurantOwnerApplication(
		userId: string,
		applicationData: { restaurantName?: string; cuisineType?: string; address?: string },
	): Promise<void> {
		const existing = await this.db
			.select()
			.from(restaurantOwnerApplications)
			.where(eq(restaurantOwnerApplications.userId, userId))
			.limit(1);

		if (existing.length > 0) {
			const app = existing[0];
			if (app.status === "REJECTED" || app.status === "NOT_APPLIED") {
				await this.db
					.update(restaurantOwnerApplications)
					.set({
						status: "PENDING",
						applicationData: JSON.stringify(applicationData),
						restaurantName: applicationData.restaurantName ?? null,
						cuisineType: applicationData.cuisineType ?? null,
						address: applicationData.address ?? null,
						submittedAt: new Date(),
						reviewedBy: null,
						reviewedAt: null,
						rejectionReason: null,
						updatedAt: new Date(),
					})
					.where(eq(restaurantOwnerApplications.userId, userId));
			}
			return;
		}

		await this.db.insert(restaurantOwnerApplications).values({
			userId,
			status: "PENDING",
			applicationData: JSON.stringify(applicationData),
			restaurantName: applicationData.restaurantName ?? null,
			cuisineType: applicationData.cuisineType ?? null,
			address: applicationData.address ?? null,
			submittedAt: new Date(),
		});

		await this.logAudit(userId, "RESTAURANT_OWNER_APPLICATION_SUBMITTED", "restaurant_owner_application", undefined, undefined, {
			userId,
			status: "PENDING",
		});
	}

	/**
	 * Approve a driver application (superadmin only).
	 */
	async approveDriverApplication(userId: string, reviewedBy: string): Promise<void> {
		await this.db
			.update(driverApplications)
			.set({
				status: "APPROVED",
				reviewedBy,
				reviewedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(driverApplications.userId, userId));

		// Assign DRIVER role to the user
		await this.assignRole(userId, "DRIVER", reviewedBy);

		// Ensure driver record exists
		const existingDriver = await this.db
			.select()
			.from(drivers)
			.where(eq(drivers.userId, userId))
			.limit(1);

		if (existingDriver.length === 0) {
			await this.db.insert(drivers).values({
				userId,
				approvalStatus: "APPROVED",
				availabilityStatus: "OFFLINE",
			});
		} else {
			await this.db
				.update(drivers)
				.set({ approvalStatus: "APPROVED", updatedAt: new Date() })
				.where(eq(drivers.userId, userId));
		}

		await this.logAudit(reviewedBy, "DRIVER_APPLICATION_APPROVED", "driver_application", undefined, userId, {
			reviewedBy,
			status: "APPROVED",
		});
	}

	/**
	 * Reject a driver application (superadmin only).
	 * Revokes DRIVER role if the user was previously approved.
	 */
	async rejectDriverApplication(userId: string, reviewedBy: string, reason?: string): Promise<void> {
		const currentStatus = await this.getDriverApplicationStatus(userId);

		await this.db
			.update(driverApplications)
			.set({
				status: "REJECTED",
				reviewedBy,
				reviewedAt: new Date(),
				rejectionReason: reason ?? null,
				updatedAt: new Date(),
			})
			.where(eq(driverApplications.userId, userId));

		// If the driver was previously approved, revoke their DRIVER role
		if (currentStatus === "APPROVED") {
			await this.revokeRole(userId, "DRIVER");

			await this.db
				.update(drivers)
				.set({ approvalStatus: "REJECTED", updatedAt: new Date() })
				.where(eq(drivers.userId, userId));
		}

		await this.logAudit(reviewedBy, "DRIVER_APPLICATION_REJECTED", "driver_application", undefined, userId, {
			reviewedBy,
			status: "REJECTED",
			reason,
		});
	}

	/**
	 * Get user account status from users table.
	 */
	async getUserStatus(userId: string): Promise<string | null> {
		const row = await this.db
			.select({ status: users.status })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		return row.length > 0 ? (row[0].status as string) : null;
	}

	/**
	 * Suspend a driver (superadmin only).
	 * Revokes DRIVER role and sets application status to SUSPENDED.
	 */
	async suspendDriver(userId: string, reviewedBy: string, reason?: string): Promise<void> {
		await this.db
			.update(driverApplications)
			.set({
				status: "SUSPENDED",
				reviewedBy,
				reviewedAt: new Date(),
				rejectionReason: reason ?? null,
				updatedAt: new Date(),
			})
			.where(eq(driverApplications.userId, userId));

		// Revoke DRIVER role - suspended drivers must not pass role checks
		await this.revokeRole(userId, "DRIVER");

		await this.db
			.update(drivers)
			.set({ approvalStatus: "SUSPENDED", updatedAt: new Date() })
			.where(eq(drivers.userId, userId));

		await this.logAudit(reviewedBy, "DRIVER_SUSPENDED", "user", userId, undefined, { reason });
	}

	/**
	 * Reinstate a driver (superadmin only).
	 * Re-assigns DRIVER role and sets application status to APPROVED.
	 */
	async reinstateDriver(userId: string, reviewedBy: string): Promise<void> {
		await this.db
			.update(driverApplications)
			.set({
				status: "APPROVED",
				reviewedBy,
				reviewedAt: new Date(),
				rejectionReason: null,
				updatedAt: new Date(),
			})
			.where(eq(driverApplications.userId, userId));

		// Re-assign DRIVER role
		await this.assignRole(userId, "DRIVER", reviewedBy);

		await this.db
			.update(drivers)
			.set({ approvalStatus: "APPROVED", updatedAt: new Date() })
			.where(eq(drivers.userId, userId));

		await this.logAudit(reviewedBy, "DRIVER_REINSTATED", "user", userId, undefined, {});
	}

	/**
	 * Approve a restaurant owner application (superadmin only).
	 */
	async approveRestaurantOwnerApplication(userId: string, reviewedBy: string): Promise<void> {
		await this.db
			.update(restaurantOwnerApplications)
			.set({
				status: "APPROVED",
				reviewedBy,
				reviewedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(restaurantOwnerApplications.userId, userId));

		// Assign RESTAURANT_OWNER role to the user
		await this.assignRole(userId, "RESTAURANT_OWNER", reviewedBy);

		await this.logAudit(reviewedBy, "RESTAURANT_OWNER_APPLICATION_APPROVED", "restaurant_owner_application", undefined, userId, {
			reviewedBy,
			status: "APPROVED",
		});
	}

	/**
	 * Reject a restaurant owner application (superadmin only).
	 * Revokes RESTAURANT_OWNER role if the user was previously approved.
	 */
	async rejectRestaurantOwnerApplication(userId: string, reviewedBy: string, reason?: string): Promise<void> {
		const currentStatus = await this.getRestaurantOwnerApplicationStatus(userId);

		await this.db
			.update(restaurantOwnerApplications)
			.set({
				status: "REJECTED",
				reviewedBy,
				reviewedAt: new Date(),
				rejectionReason: reason ?? null,
				updatedAt: new Date(),
			})
			.where(eq(restaurantOwnerApplications.userId, userId));

		// If the owner was previously approved, revoke their RESTAURANT_OWNER role
		if (currentStatus === "APPROVED") {
			await this.revokeRole(userId, "RESTAURANT_OWNER");
		}

		await this.logAudit(reviewedBy, "RESTAURANT_OWNER_APPLICATION_REJECTED", "restaurant_owner_application", undefined, userId, {
			reviewedBy,
			status: "REJECTED",
			reason,
		});
	}

	/**
	 * Suspend a restaurant owner (superadmin only).
	 * Revokes RESTAURANT_OWNER role and sets application status to SUSPENDED.
	 */
	async suspendRestaurantOwner(userId: string, reviewedBy: string, reason?: string): Promise<void> {
		await this.db
			.update(restaurantOwnerApplications)
			.set({
				status: "SUSPENDED",
				reviewedBy,
				reviewedAt: new Date(),
				rejectionReason: reason ?? null,
				updatedAt: new Date(),
			})
			.where(eq(restaurantOwnerApplications.userId, userId));

		// Revoke RESTAURANT_OWNER role - suspended owners must not pass role checks
		await this.revokeRole(userId, "RESTAURANT_OWNER");

		await this.logAudit(reviewedBy, "RESTAURANT_OWNER_SUSPENDED", "user", userId, undefined, { reason });
	}

	/**
	 * Reinstate a restaurant owner (superadmin only).
	 * Re-assigns RESTAURANT_OWNER role and sets application status to APPROVED.
	 */
	async reinstateRestaurantOwner(userId: string, reviewedBy: string): Promise<void> {
		await this.db
			.update(restaurantOwnerApplications)
			.set({
				status: "APPROVED",
				reviewedBy,
				reviewedAt: new Date(),
				rejectionReason: null,
				updatedAt: new Date(),
			})
			.where(eq(restaurantOwnerApplications.userId, userId));

		// Re-assign RESTAURANT_OWNER role
		await this.assignRole(userId, "RESTAURANT_OWNER", reviewedBy);

		await this.logAudit(reviewedBy, "RESTAURANT_OWNER_REINSTATED", "user", userId, undefined, {});
	}

	/**
	 * Check if a user owns a restaurant.
	 */
	async ownsRestaurant(userId: string, restaurantId: string): Promise<boolean> {
		const rows = await this.db
			.select({ id: restaurants.id })
			.from(restaurants)
			.where(and(eq(restaurants.id, restaurantId), eq(restaurants.ownerId, userId)));
		return rows.length > 0;
	}

	/**
	 * Check if a user is assigned to a delivery.
	 */
	async ownsDelivery(userId: string, deliveryId: string): Promise<boolean> {
		const rows = await this.db
			.select({ id: deliveries.id })
			.from(deliveries)
			.where(and(eq(deliveries.currentDriverId, userId), eq(deliveries.id, deliveryId)));
		return rows.length > 0;
	}

	/**
	 * List all driver applications.
	 */
	async listDriverApplications() {
		return this.db.select().from(driverApplications).orderBy(driverApplications.createdAt);
	}

	/**
	 * List all restaurant owner applications.
	 */
	async listRestaurantOwnerApplications() {
		return this.db.select().from(restaurantOwnerApplications).orderBy(restaurantOwnerApplications.createdAt);
	}

	/**
	 * List all users with their roles.
	 */
	async listAllUsers() {
		const allUsers = await this.db.select().from(users);
		const allRoles = await this.db.select().from(userRoles);
		const rolesByUser = new Map<string, string[]>();
		for (const r of allRoles) {
			const list = rolesByUser.get(r.userId) ?? [];
			list.push(r.role);
			rolesByUser.set(r.userId, list);
		}
		return allUsers.map((u) => ({ ...u, roles: rolesByUser.get(u.id) ?? [] }));
	}

	/**
	 * Get a user with their roles and permissions.
	 */
	async getUserWithRoles(userId: string) {
		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		if (!user || user.length === 0) return null;
		const roles = await this.getUserRoles(userId);
		const permissions = await this.getUserPermissions(userId);
		const driverStatus = await this.getDriverApplicationStatus(userId);
		const ownerStatus = await this.getRestaurantOwnerApplicationStatus(userId);
		return {
			user: user[0],
			roles,
			permissions,
			driverApplicationStatus: driverStatus,
			restaurantOwnerApplicationStatus: ownerStatus,
		};
	}

	/**
	 * Get audit logs.
	 */
	async getAuditLogs() {
		return this.db
			.select()
			.from(auditLogs)
			.orderBy(auditLogs.createdAt)
			.limit(100);
	}

	/**
	 * Log an audit event.
	 */
	async logAudit(
		userId: string | undefined,
		action: string,
		entityType: string,
		entityId: string | undefined,
		oldValues: any,
		newValues: any,
	): Promise<void> {
		try {
			await this.db.insert(auditLogs).values({
				userId,
				action,
				entityType,
				entityId,
				oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
				newValues: newValues ? JSON.stringify(newValues) : undefined,
			});
		} catch {
			// Audit logging failures should not break the main operation
		}
	}

	/**
	 * Initialize default permissions and role-permission mappings.
	 * Idempotent - safe to run multiple times.
	 */
	async initializePermissions(): Promise<void> {
		for (const [name, perm] of Object.entries(PERMISSIONS)) {
			const [resource, action] = perm.split(".");
			const existing = await this.db
				.select()
				.from(permissions)
				.where(eq(permissions.name, perm))
				.limit(1);

			if (existing.length === 0) {
				await this.db.insert(permissions).values({
					name: perm,
					description: `${action} ${resource}`,
					resource,
					action,
				});
			}
		}

		for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
			for (const permName of perms) {
				const permRow = await this.db
					.select({ id: permissions.id })
					.from(permissions)
					.where(eq(permissions.name, permName))
					.limit(1);

				if (permRow.length === 0) continue;

				const existing = await this.db
					.select()
					.from(rolePermissions)
					.where(and(eq(rolePermissions.role, role), eq(rolePermissions.permissionId, permRow[0].id)))
					.limit(1);

				if (existing.length === 0) {
					await this.db.insert(rolePermissions).values({
						role,
						permissionId: permRow[0].id,
					});
				}
			}
		}
	}
}
