import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	UseGuards,
	BadRequestException,
	NotFoundException,
	Delete,
} from "@nestjs/common";
import { RbacGuard } from "./rbac.guard.js";
import { Roles, SuperAdmin, UserId } from "./rbac.decorator.js";
import { RbacService } from "./rbac.service.js";

// Simple validation helpers
function requireFields(body: any, fields: string[]) {
	for (const field of fields) {
		if (body[field] === undefined || body[field] === null || body[field] === "") {
			throw new BadRequestException(`Missing required field: ${field}`);
		}
	}
}

@Controller("rbac")
@UseGuards(RbacGuard)
export class RbacController {
	constructor(private readonly rbacService: RbacService) {}

	// ============================================
	// User roles and permissions
	// ============================================

	@Get("me/roles")
	async getMyRoles(@UserId() userId: string) {
		const roles = await this.rbacService.getUserRoles(userId);
		const permissions = await this.rbacService.getUserPermissions(userId);
		const isSuperAdmin = await this.rbacService.isSuperAdmin(userId);
		const driverStatus = await this.rbacService.getDriverApplicationStatus(userId);
		const ownerStatus = await this.rbacService.getRestaurantOwnerApplicationStatus(userId);

		return {
			roles,
			permissions,
			isSuperAdmin,
			driverApplicationStatus: driverStatus,
			restaurantOwnerApplicationStatus: ownerStatus,
		};
	}

	// ============================================
	// Driver applications
	// ============================================

	@Post("driver/apply")
	async submitDriverApplication(@UserId() userId: string, @Body() body: any) {
		await this.rbacService.submitDriverApplication(userId, {
			vehicleType: body?.vehicleType ?? undefined,
			vehiclePlateNumber: body?.vehiclePlateNumber ?? undefined,
			licenseNumber: body?.licenseNumber ?? undefined,
		});
		return { success: true, message: "Driver application submitted" };
	}

	@Get("driver/status")
	async getDriverStatus(@UserId() userId: string) {
		const status = await this.rbacService.getDriverApplicationStatus(userId);
		const isApproved = await this.rbacService.isDriverApproved(userId);
		return { status, isApproved };
	}

	@SuperAdmin()
	@Get("driver/applications")
	async listDriverApplications() {
		const apps = await this.rbacService.listDriverApplications();
		return { applications: apps };
	}

	@SuperAdmin()
	@Post("driver/applications/:userId/approve")
	async approveDriver(@Param("userId") userId: string, @UserId() reviewerId: string) {
		await this.rbacService.approveDriverApplication(userId, reviewerId);
		return { success: true, message: "Driver application approved" };
	}

	@SuperAdmin()
	@Post("driver/applications/:userId/reject")
	async rejectDriver(@Param("userId") userId: string, @UserId() reviewerId: string, @Body() body: any) {
		await this.rbacService.rejectDriverApplication(userId, reviewerId, body?.reason);
		return { success: true, message: "Driver application rejected" };
	}

	@SuperAdmin()
	@Post("driver/applications/:userId/suspend")
	async suspendDriver(@Param("userId") userId: string, @UserId() reviewerId: string, @Body() body: any) {
		await this.rbacService.suspendDriver(userId, reviewerId, body?.reason);
		return { success: true, message: "Driver suspended" };
	}

	@SuperAdmin()
	@Post("driver/applications/:userId/reinstate")
	async reinstateDriver(@Param("userId") userId: string, @UserId() reviewerId: string) {
		await this.rbacService.reinstateDriver(userId, reviewerId);
		return { success: true, message: "Driver reinstated" };
	}

	// ============================================
	// Restaurant owner applications
	// ============================================

	@Post("restaurant-owner/apply")
	async submitRestaurantOwnerApplication(@UserId() userId: string, @Body() body: any) {
		await this.rbacService.submitRestaurantOwnerApplication(userId, {
			restaurantName: body?.restaurantName ?? undefined,
			cuisineType: body?.cuisineType ?? undefined,
			address: body?.address ?? undefined,
		});
		return { success: true, message: "Restaurant owner application submitted" };
	}

	@Get("restaurant-owner/status")
	async getRestaurantOwnerStatus(@UserId() userId: string) {
		const status = await this.rbacService.getRestaurantOwnerApplicationStatus(userId);
		const isApproved = await this.rbacService.isRestaurantOwnerApproved(userId);
		return { status, isApproved };
	}

	@SuperAdmin()
	@Get("restaurant-owner/applications")
	async listRestaurantOwnerApplications() {
		const apps = await this.rbacService.listRestaurantOwnerApplications();
		return { applications: apps };
	}

	@SuperAdmin()
	@Post("restaurant-owner/applications/:userId/approve")
	async approveRestaurantOwner(@Param("userId") userId: string, @UserId() reviewerId: string) {
		await this.rbacService.approveRestaurantOwnerApplication(userId, reviewerId);
		return { success: true, message: "Restaurant owner application approved" };
	}

	@SuperAdmin()
	@Post("restaurant-owner/applications/:userId/reject")
	async rejectRestaurantOwner(@Param("userId") userId: string, @UserId() reviewerId: string, @Body() body: any) {
		await this.rbacService.rejectRestaurantOwnerApplication(userId, reviewerId, body?.reason);
		return { success: true, message: "Restaurant owner application rejected" };
	}

	@SuperAdmin()
	@Post("restaurant-owner/applications/:userId/suspend")
	async suspendRestaurantOwner(@Param("userId") userId: string, @UserId() reviewerId: string, @Body() body: any) {
		await this.rbacService.suspendRestaurantOwner(userId, reviewerId, body?.reason);
		return { success: true, message: "Restaurant owner suspended" };
	}

	@SuperAdmin()
	@Post("restaurant-owner/applications/:userId/reinstate")
	async reinstateRestaurantOwner(@Param("userId") userId: string, @UserId() reviewerId: string) {
		await this.rbacService.reinstateRestaurantOwner(userId, reviewerId);
		return { success: true, message: "Restaurant owner reinstated" };
	}

	// ============================================
	// Superadmin: user management
	// ============================================

	@SuperAdmin()
	@Get("users")
	async listUsers() {
		const users = await this.rbacService.listAllUsers();
		return { users };
	}

	@SuperAdmin()
	@Get("users/:userId")
	async getUser(@Param("userId") userId: string) {
		const user = await this.rbacService.getUserWithRoles(userId);
		if (!user) throw new NotFoundException("User not found");
		return user;
	}

	@SuperAdmin()
	@Post("users/:userId/roles")
	async assignUserRole(@Param("userId") userId: string, @Body() body: any, @UserId() reviewerId: string) {
		requireFields(body, ["role"]);
		await this.rbacService.assignRole(userId, body.role as any, reviewerId);
		return { success: true, message: `Role ${body.role} assigned` };
	}

	@SuperAdmin()
	@Delete("users/:userId/roles/:role")
	async revokeUserRole(@Param("userId") userId: string, @Param("role") role: string, @UserId() reviewerId: string) {
		await this.rbacService.revokeRole(userId, role as any);
		return { success: true, message: `Role ${role} revoked` };
	}

	// ============================================
	// Superadmin: audit logs
	// ============================================

	@SuperAdmin()
	@Get("audit-logs")
	async getAuditLogs() {
		const logs = await this.rbacService.getAuditLogs();
		return { logs };
	}
}
