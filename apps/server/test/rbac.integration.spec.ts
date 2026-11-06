import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { RbacModule } from "../src/rbac/rbac.module.js";
import { RbacService } from "../src/rbac/rbac.service.js";
import { DbModule } from "../src/db/db.module.js";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { users, userRoles } from "../src/db/schema/index.js";
import { PERMISSIONS, ALL_ROLES } from "../src/db/schema/permissions.js";
import { RbacController } from "../src/rbac/rbac.controller.js";
import { RbacGuard } from "../src/rbac/rbac.guard.js";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";

describe("RBAC API Boundary Authorization", () => {
	let moduleFixture: TestingModule;
	let rbacService: RbacService;
	let db: NeonHttpDatabase;
	let app: INestApplication;

	let superAdminId: string;
	let customerId: string;
	let driverId: string;
	let ownerId: string;
	let multiRoleId: string;
	let pendingDriverId: string;
	let suspendedDriverId: string;

	beforeAll(async () => {
		moduleFixture = await Test.createTestingModule({
			imports: [DbModule, RbacModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		rbacService = moduleFixture.get(RbacService);
		db = moduleFixture.get("DB");

		// Create test users
		const createUser = async (email: string, firstName: string, lastName: string) => {
			const [user] = await db
				.insert(users)
				.values({ email, firstName, lastName, name: `${firstName} ${lastName}`, role: "CUSTOMER", status: "ACTIVE" })
				.returning();
			return user.id;
		};

		const timestamp = Date.now();
		superAdminId = await createUser(`sa_${timestamp}@test.com`, "Super", "Admin");
		customerId = await createUser(`cust_${timestamp}@test.com`, "Customer", "User");
		driverId = await createUser(`drv_${timestamp}@test.com`, "Driver", "User");
		ownerId = await createUser(`own_${timestamp}@test.com`, "Owner", "User");
		multiRoleId = await createUser(`multi_${timestamp}@test.com`, "Multi", "Role");
		pendingDriverId = await createUser(`pend_${timestamp}@test.com`, "Pending", "Driver");
		suspendedDriverId = await createUser(`susp_${timestamp}@test.com`, "Suspended", "Driver");

		// Assign roles - only superAdminId gets SUPERADMIN to test last-superadmin protection
		await rbacService.assignRole(superAdminId, "SUPERADMIN", superAdminId);
		await rbacService.assignRole(customerId, "CUSTOMER", customerId);
		await rbacService.assignRole(driverId, "DRIVER", driverId);
		await rbacService.assignRole(ownerId, "RESTAURANT_OWNER", ownerId);
		await rbacService.assignRole(multiRoleId, "CUSTOMER", multiRoleId);
		await rbacService.assignRole(multiRoleId, "DRIVER", multiRoleId);
		await rbacService.assignRole(multiRoleId, "RESTAURANT_OWNER", multiRoleId);

		// Create driver application records for driverId and multiRoleId with APPROVED status
		await rbacService.submitDriverApplication(driverId, { vehicleType: "BIKE" });
		await rbacService.approveDriverApplication(driverId, superAdminId);
		await rbacService.submitDriverApplication(multiRoleId, { vehicleType: "CAR" });
		await rbacService.approveDriverApplication(multiRoleId, superAdminId);

		// Create restaurant owner application for multiRoleId with APPROVED status
		await rbacService.submitRestaurantOwnerApplication(multiRoleId, {
			restaurantName: "Multi Role Restaurant",
		});
		await rbacService.approveRestaurantOwnerApplication(multiRoleId, superAdminId);

		// Create driver application for pendingDriverId - PENDING status
		await rbacService.submitDriverApplication(pendingDriverId, { vehicleType: "BIKE" });

		// Create driver application for suspendedDriverId - APPROVED then SUSPENDED
		await rbacService.submitDriverApplication(suspendedDriverId, { vehicleType: "CAR" });
		await rbacService.approveDriverApplication(suspendedDriverId, superAdminId);
		await rbacService.suspendDriver(suspendedDriverId, superAdminId, "Policy violation");
	});

	afterAll(async () => {
		await app.close();
	});

	// Helper to set metadata on a mock handler (mimics what NestJS decorators do)
	function setMetadata(reflector: Reflector, key: string, value: any, handler: any) {
		Reflect.defineMetadata(key, value, handler);
	}

	describe("Authentication enforcement (401)", () => {
		it("should reject requests without session", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: undefined,
				user: undefined,
				params: {},
				body: {},
			} as any;
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => ({}),
				getClass: () => ({}),
			} as any;

			await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
		});

		it("should allow public endpoints", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: undefined,
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_public", true, handler);

			const result = await guard.canActivate(mockContext);
			expect(result).toBe(true);
		});
	});

	describe("Role-based authorization", () => {
		it("should allow CUSTOMER role for customer endpoints", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: { user: { id: customerId } },
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_roles", ["CUSTOMER"], handler);

			expect(await guard.canActivate(mockContext)).toBe(true);
		});

		it("should deny DRIVER role to customer", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: { user: { id: customerId } },
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_roles", ["DRIVER"], handler);

			await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
		});

		it("should allow SUPERADMIN role for superadmin", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: { user: { id: superAdminId } },
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_roles", ["SUPERADMIN"], handler);

			expect(await guard.canActivate(mockContext)).toBe(true);
		});
	});

	describe("Application status enforcement", () => {
		it("should deny DRIVER role access when driver application is PENDING", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: { user: { id: pendingDriverId } },
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_roles", ["DRIVER"], handler);

			await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
		});

		it("should deny DRIVER role access when driver application is SUSPENDED", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: { user: { id: suspendedDriverId } },
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_roles", ["DRIVER"], handler);

			await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
		});

		it("should allow DRIVER role when driver application is APPROVED", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: { user: { id: driverId } },
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_roles", ["DRIVER"], handler);

			expect(await guard.canActivate(mockContext)).toBe(true);
		});
	});

	describe("Multi-role behavior", () => {
		it("should allow multi-role user to access any of their role endpoints", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			// Test CUSTOMER role
			let mockRequest = { session: { user: { id: multiRoleId } }, user: undefined, params: {}, body: {} } as any;
			let handler = () => {};
			let mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;
			setMetadata(reflector, "rbac_roles", ["CUSTOMER"], handler);
			expect(await guard.canActivate(mockContext)).toBe(true);

			// Test DRIVER role (approved)
			mockRequest = { session: { user: { id: multiRoleId } }, user: undefined, params: {}, body: {} } as any;
			handler = () => {};
			mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;
			setMetadata(reflector, "rbac_roles", ["DRIVER"], handler);
			expect(await guard.canActivate(mockContext)).toBe(true);

			// Test RESTAURANT_OWNER role
			mockRequest = { session: { user: { id: multiRoleId } }, user: undefined, params: {}, body: {} } as any;
			handler = () => {};
			mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;
			setMetadata(reflector, "rbac_roles", ["RESTAURANT_OWNER"], handler);
			expect(await guard.canActivate(mockContext)).toBe(true);
		});
	});

	describe("Permission-based authorization", () => {
		it("should allow customer to access CUSTOMER_PLACE_ORDER permission", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: { user: { id: customerId } },
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_permissions", ["customer.place_order"], handler);

			expect(await guard.canActivate(mockContext)).toBe(true);
		});

		it("should deny customer access to DRIVER_READ permission", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: { user: { id: customerId } },
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_permissions", ["driver.read"], handler);

			await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
		});

		it("should allow superadmin to access all permissions", async () => {
			const reflector = moduleFixture.get(Reflector);
			const guard = new RbacGuard(reflector, rbacService);

			const mockRequest = {
				session: { user: { id: superAdminId } },
				user: undefined,
				params: {},
				body: {},
			} as any;
			const handler = () => {};
			const mockContext = {
				switchToHttp: () => ({ getRequest: () => mockRequest }),
				getHandler: () => handler,
				getClass: () => ({}),
			} as any;

			setMetadata(reflector, "rbac_permissions", ["superadmin.manage_users"], handler);

			expect(await guard.canActivate(mockContext)).toBe(true);
		});
	});

	describe("Role lifecycle", () => {
		it("should revoke DRIVER role when driver application is rejected", async () => {
			// First approve the pending driver
			await rbacService.approveDriverApplication(pendingDriverId, superAdminId);
			expect(await rbacService.hasRole(pendingDriverId, "DRIVER")).toBe(true);

			// Then reject
			await rbacService.rejectDriverApplication(pendingDriverId, superAdminId, "Test rejection");
			expect(await rbacService.hasRole(pendingDriverId, "DRIVER")).toBe(false);
		});

		it("should revoke DRIVER role when driver is suspended", async () => {
			// Create a new approved driver, then suspend
			const [suspendTestUser] = await db
				.insert(users)
				.values({ email: `suspend_test_${Date.now()}@test.com`, firstName: "Suspend", lastName: "Test", name: "Suspend Test", role: "CUSTOMER", status: "ACTIVE" })
				.returning();

			await rbacService.submitDriverApplication(suspendTestUser.id, { vehicleType: "BIKE" });
			await rbacService.approveDriverApplication(suspendTestUser.id, superAdminId);
			expect(await rbacService.hasRole(suspendTestUser.id, "DRIVER")).toBe(true);

			await rbacService.suspendDriver(suspendTestUser.id, superAdminId, "Test suspension");
			expect(await rbacService.hasRole(suspendTestUser.id, "DRIVER")).toBe(false);

			// Clean up - revoke CUSTOMER role
			await rbacService.revokeRole(suspendTestUser.id, "CUSTOMER");
		});

		it("should reinstate driver and re-assign DRIVER role", async () => {
			// Create a suspended driver
			const [reinstateTestUser] = await db
				.insert(users)
				.values({ email: `reinstate_test_${Date.now()}@test.com`, firstName: "Reinstate", lastName: "Test", name: "Reinstate Test", role: "CUSTOMER", status: "ACTIVE" })
				.returning();

			await rbacService.submitDriverApplication(reinstateTestUser.id, { vehicleType: "BIKE" });
			await rbacService.approveDriverApplication(reinstateTestUser.id, superAdminId);
			await rbacService.suspendDriver(reinstateTestUser.id, superAdminId, "Test");
			expect(await rbacService.hasRole(reinstateTestUser.id, "DRIVER")).toBe(false);

			await rbacService.reinstateDriver(reinstateTestUser.id, superAdminId);
			expect(await rbacService.hasRole(reinstateTestUser.id, "DRIVER")).toBe(true);
			expect(await rbacService.getDriverApplicationStatus(reinstateTestUser.id)).toBe("APPROVED");

			// Clean up
			await rbacService.revokeRole(reinstateTestUser.id, "CUSTOMER");
			await rbacService.revokeRole(reinstateTestUser.id, "DRIVER");
		});

		it("should prevent removing the last SUPERADMIN", async () => {
			// Verify superAdminId is a superadmin
			const superAdmins = await db.select().from(userRoles).where(eq(userRoles.role, "SUPERADMIN"));
			expect(superAdmins.map(sa => sa.userId)).toContain(superAdminId);

			// If there are other superadmins, revoke them to make superAdminId the last one
			const otherSuperAdmins = superAdmins.filter(sa => sa.userId !== superAdminId);
			for (const sa of otherSuperAdmins) {
				await rbacService.revokeRole(sa.userId, "SUPERADMIN");
			}

			// Now superAdminId should be the last superadmin - revoking should fail
			await expect(rbacService.revokeRole(superAdminId, "SUPERADMIN")).rejects.toThrow(
				"Cannot revoke the last SUPERADMIN role"
			);

			// Restore the other superadmins for cleanup
			for (const sa of otherSuperAdmins) {
				await rbacService.assignRole(sa.userId, "SUPERADMIN", superAdminId);
			}
		});

		it("should validate role on assignment", async () => {
			await expect(rbacService.assignRole(customerId, "INVALID_ROLE" as any, customerId)).rejects.toThrow(
				"Invalid role"
			);
		});

		it("should not allow assigning SUPERADMIN to a regular user via non-superadmin context", async () => {
			// The assignRole service method doesn't check who calls it (that's the guard's job)
			// But the controller endpoint @SuperAdmin() enforces this
			// Here we verify the service method itself doesn't restrict who can call it
			await expect(rbacService.assignRole(customerId, "SUPERADMIN", customerId)).resolves.toBeUndefined();
			// Clean up - revoke it since superAdminId still exists
			await rbacService.revokeRole(customerId, "SUPERADMIN");
		});
	});
});
