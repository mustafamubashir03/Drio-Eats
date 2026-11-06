import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	UnauthorizedException,
	Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RbacService } from "./rbac.service.js";
import { type Role, type PermissionKey } from "../db/schema/permissions.js";
import { auth } from "../auth.js";

@Injectable()
export class RbacGuard implements CanActivate {
	private readonly logger = new Logger(RbacGuard.name);

	constructor(
		private readonly reflector: Reflector,
		private readonly rbacService: RbacService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		// Check for public endpoint. Honor both the DRIO RBAC marker and
		// nestjs-better-auth's @Public()/@AllowAnonymous() marker ("PUBLIC").
		const isPublic =
			this.reflector.getAllAndOverride("rbac_public", [
				context.getHandler(),
				context.getClass(),
			]) ||
			this.reflector.getAllAndOverride("PUBLIC", [
				context.getHandler(),
				context.getClass(),
			]);
		if (isPublic) return true;

		// Get the authenticated user ID (cookie/session set by Better Auth integration, or Bearer token fallback)
		let userId = request.session?.user?.id || request.user?.id;
		if (!userId) {
			const authHeader = request.headers?.authorization || request.headers?.Authorization;
			if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
				try {
					const headers = new Headers();
					headers.set("authorization", authHeader);
					const session = await (auth as any).api.getSession({ headers });
					if (session?.user?.id) {
						request.session = session;
						request.user = session.user;
						userId = session.user.id;
					}
				} catch (e) {
					this.logger.warn(`Bearer session resolution failed: ${(e as Error)?.message}`);
				}
			}
		}
		if (!userId) {
			throw new UnauthorizedException("Authentication required");
		}

		// Check if user account is suspended/banned/inactive
		const userStatus = await this.rbacService.getUserStatus(userId);
		if (userStatus && userStatus !== "ACTIVE") {
			throw new ForbiddenException(`Account is ${userStatus.toLowerCase()}`);
		}

		// Check required roles
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>("rbac_roles", [
			context.getHandler(),
			context.getClass(),
		]);
		if (requiredRoles && requiredRoles.length > 0) {
			const hasRole = await this.rbacService.hasAnyRole(userId, requiredRoles);
			if (!hasRole) {
				this.logger.warn(`User ${userId} lacks required roles: ${requiredRoles.join(", ")}`);
				throw new ForbiddenException("Insufficient role permissions");
			}

			// If DRIVER role is required, driver application must be APPROVED
			if (requiredRoles.includes("DRIVER")) {
				const driverStatus = await this.rbacService.getDriverApplicationStatus(userId);
				if (driverStatus !== "APPROVED") {
					this.logger.warn(`User ${userId} driver application not approved: ${driverStatus}`);
					throw new ForbiddenException("Driver application not approved");
				}
			}

			// If RESTAURANT_OWNER role is required, owner application must be APPROVED
			if (requiredRoles.includes("RESTAURANT_OWNER")) {
				const ownerStatus = await this.rbacService.getRestaurantOwnerApplicationStatus(userId);
				if (ownerStatus !== "APPROVED") {
					this.logger.warn(`User ${userId} owner application not approved: ${ownerStatus}`);
					throw new ForbiddenException("Restaurant owner application not approved");
				}
			}
		}

		// Check required permissions
		const requiredPermissions = this.reflector.getAllAndOverride<PermissionKey[]>("rbac_permissions", [
			context.getHandler(),
			context.getClass(),
		]);
		if (requiredPermissions && requiredPermissions.length > 0) {
			const hasPerm = await this.rbacService.hasAnyPermission(userId, requiredPermissions);
			if (!hasPerm) {
				this.logger.warn(`User ${userId} lacks required permissions: ${requiredPermissions.join(", ")}`);
				throw new ForbiddenException("Insufficient permissions");
			}
		}

		// Check restaurant ownership
		const ownsRestaurantParam = this.reflector.getAllAndOverride<string>("rbac_owns_restaurant", [
			context.getHandler(),
			context.getClass(),
		]);
		if (ownsRestaurantParam) {
			const restaurantId = request.params?.[ownsRestaurantParam] || request.body?.restaurantId;
			if (!restaurantId) {
				throw new ForbiddenException("Restaurant ID required");
			}
			const isOwner = await this.rbacService.ownsRestaurant(userId, restaurantId);
			if (!isOwner) {
				this.logger.warn(`User ${userId} does not own restaurant ${restaurantId}`);
				throw new ForbiddenException("You do not own this restaurant");
			}
		}

		// Check delivery assignment
		const ownsDeliveryParam = this.reflector.getAllAndOverride<string>("rbac_owns_delivery", [
			context.getHandler(),
			context.getClass(),
		]);
		if (ownsDeliveryParam) {
			const deliveryId = request.params?.[ownsDeliveryParam] || request.body?.deliveryId;
			if (!deliveryId) {
				throw new ForbiddenException("Delivery ID required");
			}
			const isAssigned = await this.rbacService.ownsDelivery(userId, deliveryId);
			if (!isAssigned) {
				this.logger.warn(`User ${userId} is not assigned to delivery ${deliveryId}`);
				throw new ForbiddenException("You are not assigned to this delivery");
			}
		}

		// Attach userId to request for downstream use
		request.rbacUserId = userId;

		return true;
	}
}
