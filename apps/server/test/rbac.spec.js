import "dotenv/config";
import { Test } from "@nestjs/testing";
import { RbacModule } from "../src/rbac/rbac.module.js";
import { RbacService } from "../src/rbac/rbac.service.js";
import { DbModule } from "../src/db/db.module.js";
import { eq } from "drizzle-orm";
import { users, userRoles, driverApplications } from "../src/db/schema/index.js";
import { PERMISSIONS } from "../src/db/schema/permissions.js";
describe("RBAC Authorization", () => {
    let app;
    let rbacService;
    let db;
    let superAdminUserId;
    let customerUserId;
    let driverUserId;
    let ownerUserId;
    let multiRoleUserId;
    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [DbModule, RbacModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        rbacService = app.get(RbacService);
        db = app.get("DB");
        // Create test users via direct DB insert
        const timestamp = Date.now();
        const createUser = async (email, firstName, lastName) => {
            const uniqueEmail = `test_${timestamp}_${email}`;
            const [user] = await db
                .insert(users)
                .values({ email: uniqueEmail, firstName, lastName, name: `${firstName} ${lastName}`, role: "CUSTOMER", status: "ACTIVE" })
                .returning();
            return user.id;
        };
        superAdminUserId = await createUser("sa@test.com", "Super", "Admin");
        customerUserId = await createUser("cust@test.com", "Customer", "User");
        driverUserId = await createUser("drv@test.com", "Driver", "User");
        ownerUserId = await createUser("own@test.com", "Owner", "User");
        multiRoleUserId = await createUser("multi@test.com", "Multi", "Role");
        // Assign roles
        await rbacService.assignRole(superAdminUserId, "SUPERADMIN", superAdminUserId);
        await rbacService.assignRole(customerUserId, "CUSTOMER", customerUserId);
        await rbacService.assignRole(driverUserId, "DRIVER", driverUserId);
        await rbacService.assignRole(ownerUserId, "RESTAURANT_OWNER", ownerUserId);
        await rbacService.assignRole(multiRoleUserId, "CUSTOMER", multiRoleUserId);
        await rbacService.assignRole(multiRoleUserId, "DRIVER", multiRoleUserId);
        await rbacService.assignRole(multiRoleUserId, "RESTAURANT_OWNER", multiRoleUserId);
    });
    afterAll(async () => {
        await app.close();
    });
    describe("Role assignment", () => {
        it("should assign CUSTOMER role to customer user", async () => {
            const roles = await rbacService.getUserRoles(customerUserId);
            expect(roles).toContain("CUSTOMER");
        });
        it("should assign DRIVER role to driver user", async () => {
            const roles = await rbacService.getUserRoles(driverUserId);
            expect(roles).toContain("DRIVER");
        });
        it("should assign RESTAURANT_OWNER role to owner user", async () => {
            const roles = await rbacService.getUserRoles(ownerUserId);
            expect(roles).toContain("RESTAURANT_OWNER");
        });
        it("should assign multiple roles to one user", async () => {
            const roles = await rbacService.getUserRoles(multiRoleUserId);
            expect(roles).toContain("CUSTOMER");
            expect(roles).toContain("DRIVER");
            expect(roles).toContain("RESTAURANT_OWNER");
        });
        it("should be idempotent - assigning same role twice should not duplicate", async () => {
            await rbacService.assignRole(customerUserId, "CUSTOMER", customerUserId);
            const rows = await db
                .select()
                .from(userRoles)
                .where(eq(userRoles.userId, customerUserId));
            const customerRoles = rows.filter((r) => r.role === "CUSTOMER");
            expect(customerRoles.length).toBe(1);
        });
    });
    describe("Permission checks", () => {
        it("should return customer permissions", async () => {
            const perms = await rbacService.getUserPermissions(customerUserId);
            expect(perms).toContain(PERMISSIONS.CUSTOMER_PLACE_ORDER);
            expect(perms).toContain(PERMISSIONS.CUSTOMER_VIEW_ORDERS);
        });
        it("should return driver permissions", async () => {
            const perms = await rbacService.getUserPermissions(driverUserId);
            expect(perms).toContain(PERMISSIONS.DRIVER_READ);
            expect(perms).toContain(PERMISSIONS.DRIVER_UPDATE_AVAILABILITY);
        });
        it("should return restaurant owner permissions", async () => {
            const perms = await rbacService.getUserPermissions(ownerUserId);
            expect(perms).toContain(PERMISSIONS.RESTAURANT_OWNER_CREATE_RESTAURANT);
            expect(perms).toContain(PERMISSIONS.RESTAURANT_OWNER_MANAGE_MENU);
        });
        it("should return all permissions for superadmin", async () => {
            const perms = await rbacService.getUserPermissions(superAdminUserId);
            expect(perms.length).toBeGreaterThan(0);
            expect(perms).toContain(PERMISSIONS.SUPERADMIN_MANAGE_USERS);
            expect(perms).toContain(PERMISSIONS.SUPERADMIN_APPROVE_DRIVER);
        });
        it("should check hasPermission correctly", async () => {
            expect(await rbacService.hasPermission(customerUserId, PERMISSIONS.CUSTOMER_PLACE_ORDER)).toBe(true);
            expect(await rbacService.hasPermission(customerUserId, PERMISSIONS.DRIVER_READ)).toBe(false);
        });
        it("should check hasAnyPermission correctly", async () => {
            expect(await rbacService.hasAnyPermission(customerUserId, [PERMISSIONS.CUSTOMER_PLACE_ORDER, PERMISSIONS.DRIVER_READ])).toBe(true);
            expect(await rbacService.hasAnyPermission(customerUserId, [PERMISSIONS.DRIVER_READ, PERMISSIONS.DRIVER_UPDATE_AVAILABILITY])).toBe(false);
        });
        it("should check hasAllPermissions correctly", async () => {
            expect(await rbacService.hasAllPermissions(customerUserId, [PERMISSIONS.CUSTOMER_PLACE_ORDER, PERMISSIONS.CUSTOMER_VIEW_ORDERS])).toBe(true);
            expect(await rbacService.hasAllPermissions(customerUserId, [PERMISSIONS.CUSTOMER_PLACE_ORDER, PERMISSIONS.DRIVER_READ])).toBe(false);
        });
    });
    describe("Role checks", () => {
        it("should check hasRole correctly", async () => {
            expect(await rbacService.hasRole(customerUserId, "CUSTOMER")).toBe(true);
            expect(await rbacService.hasRole(customerUserId, "SUPERADMIN")).toBe(false);
        });
        it("should check isSuperAdmin correctly", async () => {
            expect(await rbacService.isSuperAdmin(superAdminUserId)).toBe(true);
            expect(await rbacService.isSuperAdmin(customerUserId)).toBe(false);
        });
        it("should check multi-role user has all roles", async () => {
            expect(await rbacService.hasRole(multiRoleUserId, "CUSTOMER")).toBe(true);
            expect(await rbacService.hasRole(multiRoleUserId, "DRIVER")).toBe(true);
            expect(await rbacService.hasRole(multiRoleUserId, "RESTAURANT_OWNER")).toBe(true);
        });
    });
    describe("Driver application workflow", () => {
        it("should submit driver application", async () => {
            await rbacService.submitDriverApplication(customerUserId, {
                vehicleType: "BIKE",
                vehiclePlateNumber: "ABC-123",
                licenseNumber: "LIC-456",
            });
            const status = await rbacService.getDriverApplicationStatus(customerUserId);
            expect(status).toBe("PENDING");
        });
        it("should not allow duplicate driver application when already pending", async () => {
            await rbacService.submitDriverApplication(customerUserId, {
                vehicleType: "CAR",
            });
            const apps = await db.select().from(driverApplications).where(eq(driverApplications.userId, customerUserId));
            expect(apps.length).toBe(1);
        });
        it("should allow reapplication after rejection", async () => {
            await rbacService.rejectDriverApplication(customerUserId, superAdminUserId, "Not qualified");
            let status = await rbacService.getDriverApplicationStatus(customerUserId);
            expect(status).toBe("REJECTED");
            await rbacService.submitDriverApplication(customerUserId, {
                vehicleType: "CAR",
            });
            status = await rbacService.getDriverApplicationStatus(customerUserId);
            expect(status).toBe("PENDING");
        });
        it("should approve driver application", async () => {
            await rbacService.approveDriverApplication(customerUserId, superAdminUserId);
            const status = await rbacService.getDriverApplicationStatus(customerUserId);
            expect(status).toBe("APPROVED");
            const roles = await rbacService.getUserRoles(customerUserId);
            expect(roles).toContain("DRIVER");
        });
        it("should suspend driver", async () => {
            await rbacService.suspendDriver(customerUserId, superAdminUserId, "Policy violation");
            const status = await rbacService.getDriverApplicationStatus(customerUserId);
            expect(status).toBe("SUSPENDED");
        });
        it("should reinstate driver", async () => {
            await rbacService.reinstateDriver(customerUserId, superAdminUserId);
            const status = await rbacService.getDriverApplicationStatus(customerUserId);
            expect(status).toBe("APPROVED");
        });
    });
    describe("Restaurant owner application workflow", () => {
        it("should submit restaurant owner application", async () => {
            await rbacService.submitRestaurantOwnerApplication(ownerUserId, {
                restaurantName: "Test Restaurant",
                cuisineType: "Italian",
                address: "123 Main St",
            });
            const status = await rbacService.getRestaurantOwnerApplicationStatus(ownerUserId);
            expect(status).toBe("PENDING");
        });
        it("should approve restaurant owner application", async () => {
            await rbacService.approveRestaurantOwnerApplication(ownerUserId, superAdminUserId);
            const status = await rbacService.getRestaurantOwnerApplicationStatus(ownerUserId);
            expect(status).toBe("APPROVED");
            const roles = await rbacService.getUserRoles(ownerUserId);
            expect(roles).toContain("RESTAURANT_OWNER");
        });
        it("should reject restaurant owner application", async () => {
            await rbacService.rejectRestaurantOwnerApplication(ownerUserId, superAdminUserId, "Incomplete docs");
            const status = await rbacService.getRestaurantOwnerApplicationStatus(ownerUserId);
            expect(status).toBe("REJECTED");
        });
        it("should allow reapplication after rejection", async () => {
            await rbacService.submitRestaurantOwnerApplication(ownerUserId, {
                restaurantName: "New Restaurant",
            });
            const status = await rbacService.getRestaurantOwnerApplicationStatus(ownerUserId);
            expect(status).toBe("PENDING");
        });
    });
    describe("Role revocation (isolated)", () => {
        // Use a separate user to avoid affecting other tests
        let revokeTestUserId;
        beforeAll(async () => {
            const timestamp = Date.now();
            const [user] = await db
                .insert(users)
                .values({ email: `test_${timestamp}_revoke@test.com`, firstName: "Revoke", lastName: "Test", name: "Revoke Test", role: "CUSTOMER", status: "ACTIVE" })
                .returning();
            revokeTestUserId = user.id;
            await rbacService.assignRole(revokeTestUserId, "CUSTOMER", revokeTestUserId);
        });
        it("should revoke a role from a user", async () => {
            await rbacService.revokeRole(revokeTestUserId, "CUSTOMER");
            const roles = await rbacService.getUserRoles(revokeTestUserId);
            expect(roles).not.toContain("CUSTOMER");
        });
    });
});
