import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { users } from "../db/schema/user.js";
import { userRoles } from "../db/schema/userRoles.js";
import { RbacService } from "./rbac.service.js";
import { ALL_ROLES } from "../db/schema/permissions.js";

@Injectable()
export class SuperAdminBootstrap implements OnModuleInit {
	private readonly logger = new Logger(SuperAdminBootstrap.name);

	constructor(
		@Inject("DB") private readonly db: NeonHttpDatabase,
		private readonly rbacService: RbacService,
	) {}

	async onModuleInit() {
		const bootstrapEmail = process.env.SUPERADMIN_BOOTSTRAP_EMAIL ?? "mustafamubashir87@gmail.com";
		const enableBootstrap = process.env.ENABLE_SUPERADMIN_BOOTSTRAP !== "false";

		if (!enableBootstrap) {
			this.logger.log("Superadmin bootstrap is disabled (ENABLE_SUPERADMIN_BOOTSTRAP=false)");
			return;
		}

		try {
			// Find the bootstrap user
			const existing = await this.db
				.select()
				.from(users)
				.where(eq(users.email, bootstrapEmail))
				.limit(1);

			if (existing.length === 0) {
				this.logger.warn(`Superadmin bootstrap user not found: ${bootstrapEmail}. User must exist before bootstrap can run.`);
				return;
			}

			const user = existing[0];

			// Assign all roles idempotently
			for (const role of ALL_ROLES) {
				await this.rbacService.assignRole(user.id, role as any, user.id);
			}

			this.logger.log(`Superadmin bootstrap complete for ${bootstrapEmail} (roles: ${ALL_ROLES.join(", ")})`);
		} catch (error) {
			this.logger.error(`Superadmin bootstrap failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
