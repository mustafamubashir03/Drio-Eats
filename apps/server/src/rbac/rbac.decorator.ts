import { SetMetadata, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { type Role, type PermissionKey } from "../db/schema/permissions.js";

/**
 * Decorator to require specific roles for an endpoint.
 * Usage: @Roles("SUPERADMIN") or @Roles("CUSTOMER", "DRIVER")
 */
export const Roles = (...roles: Role[]) => SetMetadata("rbac_roles", roles);

/**
 * Decorator to require specific permissions for an endpoint.
 * Usage: @Permissions("driver.read", "driver.update_availability")
 */
export const Permissions = (...perms: PermissionKey[]) => SetMetadata("rbac_permissions", perms);

/**
 * Decorator to mark an endpoint as public (no auth required).
 * Re-exported from nestjs-better-auth for convenience.
 */
export const Public = () => SetMetadata("rbac_public", true);

/**
 * Decorator to require superadmin access.
 */
export const SuperAdmin = () => Roles("SUPERADMIN");

/**
 * Decorator to require restaurant ownership for a specific restaurant.
 * Usage: @OwnsRestaurant("restaurantId") where restaurantId is a param name.
 */
export const OwnsRestaurant = (paramName: string = "restaurantId") =>
	SetMetadata("rbac_owns_restaurant", paramName);

/**
 * Decorator to require delivery assignment for a specific delivery.
 * Usage: @OwnsDelivery("deliveryId") where deliveryId is a param name.
 */
export const OwnsDelivery = (paramName: string = "deliveryId") =>
	SetMetadata("rbac_owns_delivery", paramName);

/**
 * Extract the authenticated user's ID from the request context.
 * Works with both @Session() from nestjs-better-auth and manual extraction.
 */
export const UserId = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): string | undefined => {
		const request = ctx.switchToHttp().getRequest();
		// @Session() from nestjs-better-auth attaches session to request
		const session = request.session;
		if (session?.user?.id) return session.user.id;
		// Fallback: check for user property
		if (request.user?.id) return request.user.id;
		return undefined;
	},
);

/**
 * Extract the full session from the request context.
 */
export const RbacSession = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): any => {
		const request = ctx.switchToHttp().getRequest();
		return request.session;
	},
);
