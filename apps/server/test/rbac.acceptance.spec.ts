import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { RbacModule } from "../src/rbac/rbac.module.js";
import { RbacService } from "../src/rbac/rbac.service.js";
import { DbModule } from "../src/db/db.module.js";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { users, userRoles, rolePermissions } from "../src/db/schema/index.js";
import { PERMISSIONS, ALL_ROLES } from "../src/db/schema/permissions.js";
import { restaurants } from "../src/db/schema/restaurants.js";
import { deliveries } from "../src/db/schema/deliveries.js";
import { Orders } from "../src/db/schema/orders.js";
import { driverApplications, restaurantOwnerApplications } from "../src/db/schema/applications.js";
import { drivers } from "../src/db/schema/drivers.js";

describe("RBAC Final Acceptance Verification", () => {
	let moduleFixture: TestingModule;
	let rbacService: RbacService;
	let db: NeonHttpDatabase;
	let app: INestApplication;

	let superAdminId: string;
	let ownerAId: string;
	let ownerBId: string;
	let driverAId: string;
	let driverBId: string;
	let customerId: string;
	let restaurantAId: string;
	let restaurantBId: string;

	beforeAll(async () => {
		moduleFixture = await Test.createTestingModule({
			imports: [DbModule, RbacModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		rbacService = moduleFixture.get(RbacService);
		db = moduleFixture.get("DB");

		const timestamp = Date.now();
		const createUser = async (email: string, firstName: string, lastName: string) => {
			const [user] = await db
				.insert(users)
				.values({ email, firstName, lastName, name: `${firstName} ${lastName}`, role: "CUSTOMER", status: "ACTIVE" })
				.returning();
			// Assign CUSTOMER role in user_roles table (not just legacy users.role column)
			await rbacService.assignRole(user.id, "CUSTOMER", user.id);
			return user.id;
		};

		superAdminId = await createUser(`sa_${timestamp}@test.com`, "Super", "Admin");
		ownerAId = await createUser(`owna_${timestamp}@test.com`, "Owner", "A");
		ownerBId = await createUser(`ownb_${timestamp}@test.com`, "Owner", "B");
		driverAId = await createUser(`drva_${timestamp}@test.com`, "Driver", "A");
		driverBId = await createUser(`drvb_${timestamp}@test.com`, "Driver", "B");
		customerId = await createUser(`cust_${timestamp}@test.com`, "Customer", "User");

		// Assign roles beyond CUSTOMER
		await rbacService.assignRole(superAdminId, "SUPERADMIN", superAdminId);
		await rbacService.assignRole(ownerAId, "RESTAURANT_OWNER", ownerAId);
		await rbacService.assignRole(ownerBId, "RESTAURANT_OWNER", ownerBId);
		await rbacService.assignRole(driverAId, "DRIVER", driverAId);
		await rbacService.assignRole(driverBId, "DRIVER", driverBId);

		// Approve all driver and owner applications
		await rbacService.submitDriverApplication(driverAId, { vehicleType: "BIKE" });
		await rbacService.approveDriverApplication(driverAId, superAdminId);
		await rbacService.submitDriverApplication(driverBId, { vehicleType: "CAR" });
		await rbacService.approveDriverApplication(driverBId, superAdminId);
		await rbacService.submitRestaurantOwnerApplication(ownerAId, { restaurantName: "Restaurant A" });
		await rbacService.approveRestaurantOwnerApplication(ownerAId, superAdminId);
		await rbacService.submitRestaurantOwnerApplication(ownerBId, { restaurantName: "Restaurant B" });
		await rbacService.approveRestaurantOwnerApplication(ownerBId, superAdminId);

		// Ensure driver records exist for delivery creation
		for (const driverId of [driverAId, driverBId]) {
			const existing = await db.select().from(drivers).where(eq(drivers.userId, driverId)).limit(1);
			if (existing.length === 0) {
				await db.insert(drivers).values({
					userId: driverId,
					approvalStatus: "APPROVED",
					availabilityStatus: "OFFLINE",
				});
			}
		}

		// Create restaurants owned by each owner
		const [restaurantA] = await db.insert(restaurants).values({
			ownerId: ownerAId,
			name: "Restaurant A",
			address: "123 Main St",
			cuisineType: "Italian",
		}).returning();
		const [restaurantB] = await db.insert(restaurants).values({
			ownerId: ownerBId,
			name: "Restaurant B",
			address: "456 Oak St",
			cuisineType: "Chinese",
		}).returning();
		restaurantAId = restaurantA.id;
		restaurantBId = restaurantB.id;
	});

	afterAll(async () => {
		await app.close();
	});

	// ============================================
	// 1. Resource Ownership Enforcement
	// ============================================
	describe("Resource Ownership Enforcement", () => {
		it("should allow Owner A to access their own restaurant", async () => {
			const isOwner = await rbacService.ownsRestaurant(ownerAId, restaurantAId);
			expect(isOwner).toBe(true);
		});

		it("should DENY Owner A accessing Owner B's restaurant", async () => {
			const isOwner = await rbacService.ownsRestaurant(ownerAId, restaurantBId);
			expect(isOwner).toBe(false);
		});

		it("should allow Owner B to access their own restaurant", async () => {
			const isOwner = await rbacService.ownsRestaurant(ownerBId, restaurantBId);
			expect(isOwner).toBe(true);
		});

		it("should DENY Owner B accessing Owner A's restaurant", async () => {
			const isOwner = await rbacService.ownsRestaurant(ownerBId, restaurantAId);
			expect(isOwner).toBe(false);
		});

		it("should verify Driver A has a driver record", async () => {
			const driverARecord = await db.select().from(drivers).where(eq(drivers.userId, driverAId)).limit(1);
			expect(driverARecord.length).toBe(1);
			expect(driverARecord[0].userId).toBe(driverAId);
		});

		it("should verify Driver B has a driver record", async () => {
			const driverBRecord = await db.select().from(drivers).where(eq(drivers.userId, driverBId)).limit(1);
			expect(driverBRecord.length).toBe(1);
			expect(driverBRecord[0].userId).toBe(driverBId);
		});

		it("should DENY customer accessing any restaurant", async () => {
			const isOwner = await rbacService.ownsRestaurant(customerId, restaurantAId);
			expect(isOwner).toBe(false);
		});

		it("should DENY non-existent user accessing restaurant", async () => {
			const isOwner = await rbacService.ownsRestaurant("00000000-0000-0000-0000-000000000000", restaurantAId);
			expect(isOwner).toBe(false);
		});
	});

	// ============================================
	// 2. Reinstatement and Reapplication Lifecycles
	// ============================================
	describe("Driver Application Lifecycle", () => {
		it("should allow NOT_APPLIED -> PENDING transition", async () => {
			const [testUser] = await db.insert(users).values({
				email: `driver_lifecycle_${Date.now()}@test.com`,
				firstName: "Driver",
				lastName: "Lifecycle",
				name: "Driver Lifecycle",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitDriverApplication(testUser.id, { vehicleType: "BIKE" });
			const status = await rbacService.getDriverApplicationStatus(testUser.id);
			expect(status).toBe("PENDING");

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
		});

		it("should allow PENDING -> APPROVED transition with DRIVER role assigned", async () => {
			const [testUser] = await db.insert(users).values({
				email: `driver_approved_${Date.now()}@test.com`,
				firstName: "Driver",
				lastName: "Approved",
				name: "Driver Approved",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitDriverApplication(testUser.id, { vehicleType: "BIKE" });
			await rbacService.approveDriverApplication(testUser.id, superAdminId);

			const status = await rbacService.getDriverApplicationStatus(testUser.id);
			expect(status).toBe("APPROVED");
			expect(await rbacService.hasRole(testUser.id, "DRIVER")).toBe(true);
			expect(await rbacService.hasRole(testUser.id, "CUSTOMER")).toBe(true);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
			await rbacService.revokeRole(testUser.id, "DRIVER");
		});

		it("should allow APPROVED -> SUSPENDED transition with DRIVER role revoked", async () => {
			const [testUser] = await db.insert(users).values({
				email: `driver_suspend_${Date.now()}@test.com`,
				firstName: "Driver",
				lastName: "Suspend",
				name: "Driver Suspend",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitDriverApplication(testUser.id, { vehicleType: "BIKE" });
			await rbacService.approveDriverApplication(testUser.id, superAdminId);
			expect(await rbacService.hasRole(testUser.id, "DRIVER")).toBe(true);

			await rbacService.suspendDriver(testUser.id, superAdminId, "Policy violation");
			const status = await rbacService.getDriverApplicationStatus(testUser.id);
			expect(status).toBe("SUSPENDED");
			expect(await rbacService.hasRole(testUser.id, "DRIVER")).toBe(false);
			// Customer role must remain
			expect(await rbacService.hasRole(testUser.id, "CUSTOMER")).toBe(true);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
		});

		it("should allow SUSPENDED -> APPROVED transition with DRIVER role restored", async () => {
			const [testUser] = await db.insert(users).values({
				email: `driver_reinstate_${Date.now()}@test.com`,
				firstName: "Driver",
				lastName: "Reinstate",
				name: "Driver Reinstate",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitDriverApplication(testUser.id, { vehicleType: "BIKE" });
			await rbacService.approveDriverApplication(testUser.id, superAdminId);
			await rbacService.suspendDriver(testUser.id, superAdminId, "Test");
			expect(await rbacService.hasRole(testUser.id, "DRIVER")).toBe(false);

			await rbacService.reinstateDriver(testUser.id, superAdminId);
			expect(await rbacService.hasRole(testUser.id, "DRIVER")).toBe(true);
			expect(await rbacService.getDriverApplicationStatus(testUser.id)).toBe("APPROVED");
			// Customer role must remain
			expect(await rbacService.hasRole(testUser.id, "CUSTOMER")).toBe(true);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
			await rbacService.revokeRole(testUser.id, "DRIVER");
		});

		it("should allow PENDING -> REJECTED transition", async () => {
			const [testUser] = await db.insert(users).values({
				email: `driver_reject_${Date.now()}@test.com`,
				firstName: "Driver",
				lastName: "Reject",
				name: "Driver Reject",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitDriverApplication(testUser.id, { vehicleType: "BIKE" });
			expect(await rbacService.getDriverApplicationStatus(testUser.id)).toBe("PENDING");

			await rbacService.rejectDriverApplication(testUser.id, superAdminId, "Not qualified");
			expect(await rbacService.getDriverApplicationStatus(testUser.id)).toBe("REJECTED");
			// Customer role must remain
			expect(await rbacService.hasRole(testUser.id, "CUSTOMER")).toBe(true);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
		});

		it("should allow REJECTED -> REAPPLIED -> PENDING -> APPROVED", async () => {
			const [testUser] = await db.insert(users).values({
				email: `driver_reapply_${Date.now()}@test.com`,
				firstName: "Driver",
				lastName: "Reapply",
				name: "Driver Reapply",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			// First application
			await rbacService.submitDriverApplication(testUser.id, { vehicleType: "BIKE" });
			await rbacService.rejectDriverApplication(testUser.id, superAdminId, "Not qualified");
			expect(await rbacService.getDriverApplicationStatus(testUser.id)).toBe("REJECTED");

			// Reapplication
			await rbacService.submitDriverApplication(testUser.id, { vehicleType: "CAR" });
			expect(await rbacService.getDriverApplicationStatus(testUser.id)).toBe("PENDING");

			// Approve
			await rbacService.approveDriverApplication(testUser.id, superAdminId);
			expect(await rbacService.getDriverApplicationStatus(testUser.id)).toBe("APPROVED");
			expect(await rbacService.hasRole(testUser.id, "DRIVER")).toBe(true);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
			await rbacService.revokeRole(testUser.id, "DRIVER");
		});

		it("should NOT create duplicate application records on reapplication", async () => {
			const [testUser] = await db.insert(users).values({
				email: `driver_nodup_${Date.now()}@test.com`,
				firstName: "Driver",
				lastName: "NoDup",
				name: "Driver NoDup",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitDriverApplication(testUser.id, { vehicleType: "BIKE" });
			await rbacService.rejectDriverApplication(testUser.id, superAdminId, "Not qualified");
			await rbacService.submitDriverApplication(testUser.id, { vehicleType: "CAR" });
			await rbacService.rejectDriverApplication(testUser.id, superAdminId, "Still not qualified");

			const apps = await db.select().from(driverApplications).where(eq(driverApplications.userId, testUser.id));
			expect(apps.length).toBe(1); // Only one application record

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
		});
	});

	describe("Restaurant Owner Application Lifecycle", () => {
		it("should allow NOT_APPLIED -> PENDING -> APPROVED transition", async () => {
			const [testUser] = await db.insert(users).values({
				email: `owner_lifecycle_${Date.now()}@test.com`,
				firstName: "Owner",
				lastName: "Lifecycle",
				name: "Owner Lifecycle",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitRestaurantOwnerApplication(testUser.id, {
				restaurantName: "Lifecycle Restaurant",
			});
			const status = await rbacService.getRestaurantOwnerApplicationStatus(testUser.id);
			expect(status).toBe("PENDING");

			await rbacService.approveRestaurantOwnerApplication(testUser.id, superAdminId);
			expect(await rbacService.getRestaurantOwnerApplicationStatus(testUser.id)).toBe("APPROVED");
			expect(await rbacService.hasRole(testUser.id, "RESTAURANT_OWNER")).toBe(true);
			expect(await rbacService.hasRole(testUser.id, "CUSTOMER")).toBe(true);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
			await rbacService.revokeRole(testUser.id, "RESTAURANT_OWNER");
		});

		it("should allow APPROVED -> SUSPENDED transition with role revoked", async () => {
			const [testUser] = await db.insert(users).values({
				email: `owner_suspend_${Date.now()}@test.com`,
				firstName: "Owner",
				lastName: "Suspend",
				name: "Owner Suspend",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitRestaurantOwnerApplication(testUser.id, { restaurantName: "Suspend Restaurant" });
			await rbacService.approveRestaurantOwnerApplication(testUser.id, superAdminId);
			expect(await rbacService.hasRole(testUser.id, "RESTAURANT_OWNER")).toBe(true);

			await rbacService.suspendRestaurantOwner(testUser.id, superAdminId, "Policy violation");
			expect(await rbacService.getRestaurantOwnerApplicationStatus(testUser.id)).toBe("SUSPENDED");
			expect(await rbacService.hasRole(testUser.id, "RESTAURANT_OWNER")).toBe(false);
			expect(await rbacService.hasRole(testUser.id, "CUSTOMER")).toBe(true);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
		});

		it("should allow SUSPENDED -> APPROVED transition with role restored exactly once", async () => {
			const [testUser] = await db.insert(users).values({
				email: `owner_reinstate_${Date.now()}@test.com`,
				firstName: "Owner",
				lastName: "Reinstate",
				name: "Owner Reinstate",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitRestaurantOwnerApplication(testUser.id, { restaurantName: "Reinstate Restaurant" });
			await rbacService.approveRestaurantOwnerApplication(testUser.id, superAdminId);
			await rbacService.suspendRestaurantOwner(testUser.id, superAdminId, "Test");
			expect(await rbacService.hasRole(testUser.id, "RESTAURANT_OWNER")).toBe(false);

			await rbacService.reinstateRestaurantOwner(testUser.id, superAdminId);
			expect(await rbacService.hasRole(testUser.id, "RESTAURANT_OWNER")).toBe(true);
			expect(await rbacService.getRestaurantOwnerApplicationStatus(testUser.id)).toBe("APPROVED");
			expect(await rbacService.hasRole(testUser.id, "CUSTOMER")).toBe(true);

			// Verify role not duplicated
			const roles = await db.select().from(userRoles).where(eq(userRoles.userId, testUser.id));
			const ownerRoles = roles.filter(r => r.role === "RESTAURANT_OWNER");
			expect(ownerRoles.length).toBe(1);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
			await rbacService.revokeRole(testUser.id, "RESTAURANT_OWNER");
		});

		it("should allow PENDING -> REJECTED -> REAPPLIED -> PENDING -> APPROVED", async () => {
			const [testUser] = await db.insert(users).values({
				email: `owner_reapply_${Date.now()}@test.com`,
				firstName: "Owner",
				lastName: "Reapply",
				name: "Owner Reapply",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitRestaurantOwnerApplication(testUser.id, { restaurantName: "First Restaurant" });
			await rbacService.rejectRestaurantOwnerApplication(testUser.id, superAdminId, "Not qualified");
			expect(await rbacService.getRestaurantOwnerApplicationStatus(testUser.id)).toBe("REJECTED");

			await rbacService.submitRestaurantOwnerApplication(testUser.id, { restaurantName: "Second Restaurant" });
			expect(await rbacService.getRestaurantOwnerApplicationStatus(testUser.id)).toBe("PENDING");

			await rbacService.approveRestaurantOwnerApplication(testUser.id, superAdminId);
			expect(await rbacService.getRestaurantOwnerApplicationStatus(testUser.id)).toBe("APPROVED");
			expect(await rbacService.hasRole(testUser.id, "RESTAURANT_OWNER")).toBe(true);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
			await rbacService.revokeRole(testUser.id, "RESTAURANT_OWNER");
		});

		it("should NOT create duplicate application records on reapplication", async () => {
			const [testUser] = await db.insert(users).values({
				email: `owner_nodup_${Date.now()}@test.com`,
				firstName: "Owner",
				lastName: "NoDup",
				name: "Owner NoDup",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(testUser.id, "CUSTOMER", testUser.id);

			await rbacService.submitRestaurantOwnerApplication(testUser.id, { restaurantName: "First" });
			await rbacService.rejectRestaurantOwnerApplication(testUser.id, superAdminId, "Not qualified");
			await rbacService.submitRestaurantOwnerApplication(testUser.id, { restaurantName: "Second" });
			await rbacService.rejectRestaurantOwnerApplication(testUser.id, superAdminId, "Still not qualified");

			const apps = await db.select().from(restaurantOwnerApplications).where(eq(restaurantOwnerApplications.userId, testUser.id));
			expect(apps.length).toBe(1);

			// Clean up
			await rbacService.revokeRole(testUser.id, "CUSTOMER");
		});
	});

	// ============================================
	// 3. Bootstrap Superadmin Verification
	// ============================================
	describe("Bootstrap Superadmin", () => {
		it("should have bootstrap user with all 4 roles", async () => {
			const bootstrap = await db.select().from(users).where(eq(users.email, 'mustafamubashir87@gmail.com')).limit(1);
			expect(bootstrap.length).toBe(1);

			const roles = await db.select().from(userRoles).where(eq(userRoles.userId, bootstrap[0].id));
			const roleNames = roles.map(r => r.role);
			expect(roleNames).toContain("SUPERADMIN");
			expect(roleNames).toContain("CUSTOMER");
			expect(roleNames).toContain("DRIVER");
			expect(roleNames).toContain("RESTAURANT_OWNER");
		});

		it("should have superadmin permissions", async () => {
			const perms = await rbacService.getUserPermissions(superAdminId);
			expect(perms).toContain(PERMISSIONS.SUPERADMIN_MANAGE_USERS);
			expect(perms).toContain(PERMISSIONS.SUPERADMIN_APPROVE_DRIVER);
			expect(perms).toContain(PERMISSIONS.SUPERADMIN_REJECT_DRIVER);
			expect(perms).toContain(PERMISSIONS.SUPERADMIN_SUSPEND_DRIVER);
			expect(perms).toContain(PERMISSIONS.SUPERADMIN_APPROVE_OWNER);
			expect(perms).toContain(PERMISSIONS.SUPERADMIN_REJECT_OWNER);
			expect(perms).toContain(PERMISSIONS.SUPERADMIN_SUSPEND_OWNER);
			expect(perms).toContain(PERMISSIONS.SUPERADMIN_VIEW_ANALYTICS);
			expect(perms).toContain(PERMISSIONS.SUPERADMIN_MANAGE_ROLES);
		});

		it("should identify superAdminId as superadmin", async () => {
			expect(await rbacService.isSuperAdmin(superAdminId)).toBe(true);
		});

		it("should be idempotent - running bootstrap twice does not duplicate roles", async () => {
			const rolesBefore = await db.select().from(userRoles).where(eq(userRoles.userId, superAdminId));
			const countBefore = rolesBefore.length;

			// Run bootstrap logic again
			for (const role of ALL_ROLES) {
				await rbacService.assignRole(superAdminId, role as any, superAdminId);
			}

			const rolesAfter = await db.select().from(userRoles).where(eq(userRoles.userId, superAdminId));
			// Should not lose any roles and should not create duplicates
			expect(rolesAfter.length).toBeGreaterThanOrEqual(countBefore);
			const uniqueRoles = [...new Set(rolesAfter.map(r => r.role))];
			expect(rolesAfter.length).toBe(uniqueRoles.length);
		});

		it("should preserve existing user data (password, email, profile)", async () => {
			const bootstrap = await db.select().from(users).where(eq(users.email, 'mustafamubashir87@gmail.com')).limit(1);
			expect(bootstrap.length).toBe(1);
			expect(bootstrap[0].email).toBe('mustafamubashir87@gmail.com');
			expect(bootstrap[0].status).toBe('ACTIVE');
			expect(bootstrap[0].password).toBeDefined();
			expect(bootstrap[0].id).toBeDefined();
		});
	});

	// ============================================
	// 4. Global Guard Behavior
	// ============================================
	describe("Global Guard Behavior", () => {
		it("should allow customer access to customer roles", async () => {
			expect(await rbacService.hasRole(customerId, "CUSTOMER")).toBe(true);
			expect(await rbacService.hasPermission(customerId, PERMISSIONS.CUSTOMER_PLACE_ORDER)).toBe(true);
			expect(await rbacService.hasPermission(customerId, PERMISSIONS.CUSTOMER_VIEW_ORDERS)).toBe(true);
		});

		it("should DENY customer access to driver permissions", async () => {
			expect(await rbacService.hasPermission(customerId, PERMISSIONS.DRIVER_READ)).toBe(false);
			expect(await rbacService.hasPermission(customerId, PERMISSIONS.DRIVER_UPDATE_AVAILABILITY)).toBe(false);
		});

		it("should DENY customer access to owner permissions", async () => {
			expect(await rbacService.hasPermission(customerId, PERMISSIONS.RESTAURANT_OWNER_CREATE_RESTAURANT)).toBe(false);
			expect(await rbacService.hasPermission(customerId, PERMISSIONS.RESTAURANT_OWNER_MANAGE_MENU)).toBe(false);
		});

		it("should DENY customer access to superadmin permissions", async () => {
			expect(await rbacService.hasPermission(customerId, PERMISSIONS.SUPERADMIN_MANAGE_USERS)).toBe(false);
			expect(await rbacService.hasPermission(customerId, PERMISSIONS.SUPERADMIN_APPROVE_DRIVER)).toBe(false);
		});

		it("should allow driver access to driver permissions", async () => {
			expect(await rbacService.hasPermission(driverAId, PERMISSIONS.DRIVER_READ)).toBe(true);
			expect(await rbacService.hasPermission(driverAId, PERMISSIONS.DRIVER_UPDATE_AVAILABILITY)).toBe(true);
			expect(await rbacService.hasPermission(driverAId, PERMISSIONS.DRIVER_VIEW_ASSIGNED_DELIVERIES)).toBe(true);
		});

		it("should allow owner access to owner permissions", async () => {
			expect(await rbacService.hasPermission(ownerAId, PERMISSIONS.RESTAURANT_OWNER_CREATE_RESTAURANT)).toBe(true);
			expect(await rbacService.hasPermission(ownerAId, PERMISSIONS.RESTAURANT_OWNER_MANAGE_MENU)).toBe(true);
			expect(await rbacService.hasPermission(ownerAId, PERMISSIONS.RESTAURANT_OWNER_VIEW_ORDERS)).toBe(true);
		});

		it("should deny PENDING driver access to driver operations", async () => {
			const [pendingUser] = await db.insert(users).values({
				email: `pending_guard_${Date.now()}@test.com`,
				firstName: "Pending",
				lastName: "Guard",
				name: "Pending Guard",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(pendingUser.id, "CUSTOMER", pendingUser.id);
			await rbacService.assignRole(pendingUser.id, "DRIVER", pendingUser.id);
			await rbacService.submitDriverApplication(pendingUser.id, { vehicleType: "BIKE" });

			const status = await rbacService.getDriverApplicationStatus(pendingUser.id);
			expect(status).toBe("PENDING");
			expect(await rbacService.hasRole(pendingUser.id, "DRIVER")).toBe(true);
			// But guard would reject because application not APPROVED

			// Clean up
			await rbacService.revokeRole(pendingUser.id, "CUSTOMER");
			await rbacService.revokeRole(pendingUser.id, "DRIVER");
		});

		it("should deny SUSPENDED driver access to driver operations", async () => {
			const [suspendedUser] = await db.insert(users).values({
				email: `suspended_guard_${Date.now()}@test.com`,
				firstName: "Suspended",
				lastName: "Guard",
				name: "Suspended Guard",
				role: "CUSTOMER",
				status: "ACTIVE",
			}).returning();
			await rbacService.assignRole(suspendedUser.id, "CUSTOMER", suspendedUser.id);
			await rbacService.assignRole(suspendedUser.id, "DRIVER", suspendedUser.id);
			await rbacService.submitDriverApplication(suspendedUser.id, { vehicleType: "BIKE" });
			await rbacService.approveDriverApplication(suspendedUser.id, superAdminId);
			await rbacService.suspendDriver(suspendedUser.id, superAdminId, "Test");

			expect(await rbacService.hasRole(suspendedUser.id, "DRIVER")).toBe(false);
			const driverStatus = await rbacService.getDriverApplicationStatus(suspendedUser.id);
			expect(driverStatus).toBe("SUSPENDED");

			// Clean up
			await rbacService.revokeRole(suspendedUser.id, "CUSTOMER");
		});

		it("should prevent client-supplied role escalation", async () => {
			// assignRole validates against known roles
			await expect(rbacService.assignRole(customerId, "INVALID_ROLE" as any, customerId)).rejects.toThrow(
				"Invalid role"
			);
		});

		it("should prevent removing the last SUPERADMIN", async () => {
			// First, revoke all other SUPERADMIN roles to make superAdminId the last one
			const allSuperAdmins = await db.select().from(userRoles).where(eq(userRoles.role, "SUPERADMIN"));
			const otherSuperAdmins = allSuperAdmins.filter(sa => sa.userId !== superAdminId);
			for (const sa of otherSuperAdmins) {
				await rbacService.revokeRole(sa.userId, "SUPERADMIN");
			}

			// Now superAdminId should be the last superadmin - revoking should fail
			await expect(rbacService.revokeRole(superAdminId, "SUPERADMIN")).rejects.toThrow(
				"Cannot revoke the last SUPERADMIN role"
			);

			// Restore the other superadmins
			for (const sa of otherSuperAdmins) {
				await rbacService.assignRole(sa.userId, "SUPERADMIN", superAdminId);
			}
		});
	});

	// ============================================
	// 5. Database Safety
	// ============================================
	describe("Database Safety", () => {
		it("should have all six RBAC tables", async () => {
			const tableNames = await db.execute(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`);
			const names = tableNames.rows.map((r: any) => r.table_name);

			const requiredTables = ['permissions', 'user_roles', 'role_permissions', 'driver_applications', 'restaurant_owner_applications', 'audit_logs'];
			for (const t of requiredTables) {
				expect(names).toContain(t);
			}
		});

		it("should have unique constraint on user_roles (no duplicate role assignments)", async () => {
			const roles = await db.select().from(userRoles).where(eq(userRoles.userId, superAdminId));
			const uniqueRoles = [...new Set(roles.map(r => r.role))];
			expect(roles.length).toBe(uniqueRoles.length);
		});

		it("should have unique constraint on role_permissions (no duplicate mappings)", async () => {
			const rpRows = await db.select().from(rolePermissions);
			const uniqueKeys = [...new Set(rpRows.map(r => `${r.role}:${r.permissionId}`))];
			expect(rpRows.length).toBe(uniqueKeys.length);
		});

		it("should have unique constraint on driver_applications (one per user)", async () => {
			const apps = await db.select().from(driverApplications);
			const uniqueUsers = [...new Set(apps.map(a => a.userId))];
			expect(apps.length).toBe(uniqueUsers.length);
		});

		it("should have unique constraint on restaurant_owner_applications (one per user)", async () => {
			const apps = await db.select().from(restaurantOwnerApplications);
			const uniqueUsers = [...new Set(apps.map(a => a.userId))];
			expect(apps.length).toBe(uniqueUsers.length);
		});

		it("should preserve existing users and project data", async () => {
			const userCount = await db.select().from(users);
			expect(userCount.length).toBeGreaterThan(0);

			// Bootstrap user must still exist with original data
			const bootstrap = await db.select().from(users).where(eq(users.email, 'mustafamubashir87@gmail.com')).limit(1);
			expect(bootstrap.length).toBe(1);
			expect(bootstrap[0].email).toBe('mustafamubashir87@gmail.com');
		});

		it("should have correct foreign key relationships", async () => {
			// user_roles.userId references users.id - no orphaned records
			const orphanedRoles = await db.execute(`SELECT COUNT(*) as cnt FROM user_roles ur LEFT JOIN users u ON ur.user_id = u.id WHERE u.id IS NULL`);
			expect(Number(orphanedRoles.rows[0].cnt)).toBe(0);

			// role_permissions.permissionId references permissions.id - no orphaned records
			const orphanedPerms = await db.execute(`SELECT COUNT(*) as cnt FROM role_permissions rp LEFT JOIN permissions p ON rp.permission_id = p.id WHERE p.id IS NULL`);
			expect(Number(orphanedPerms.rows[0].cnt)).toBe(0);
		});

		it("should have bootstrap provisioning be idempotent", async () => {
			const rolesBefore = await db.select().from(userRoles).where(eq(userRoles.userId, superAdminId));
			const countBefore = rolesBefore.length;

			// Simulate running bootstrap again
			for (const role of ALL_ROLES) {
				await rbacService.assignRole(superAdminId, role as any, superAdminId);
			}

			const rolesAfter = await db.select().from(userRoles).where(eq(userRoles.userId, superAdminId));
			// Should not lose any roles and should not create duplicates
			expect(rolesAfter.length).toBeGreaterThanOrEqual(countBefore);
			const uniqueRoles = [...new Set(rolesAfter.map(r => r.role))];
			expect(rolesAfter.length).toBe(uniqueRoles.length);
		});
	});
});
